import { Injectable } from '@angular/core'
import decode from 'jwt-decode'
import { BehaviorSubject, Observable, pipe, throwError } from 'rxjs'
import { catchError, filter, map, mergeMap, tap } from 'rxjs/operators'

import { transformError } from '../common/common'
import { User } from '../user/user/user.im'
import { IUser } from '../user/user/user.in'
import { IAuthStatus, IServerAuthResponse, defaultAuthStatus } from './auth-status.in'
import { IAuthService } from './auth.service.in'
import { CahceService } from './cash.service'

@Injectable()
export abstract class AuthService extends CahceService implements IAuthService {
  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus)
  readonly currentUser$ = new BehaviorSubject<IUser>(new User())

  constructor() {
    super()
    if (this.hasExpiredToken()) {
      this.logout()
    } else {
      this.authStatus$.next(this.getAuthFromToken())
      setTimeout(() => this.resumeCurrentUser$.subscribe(), 0)
    }
  }
  private getAndUpdateUserIfAuthenticated = pipe(
    filter((status: IAuthStatus) => status.isAuthenticated),
    mergeMap(() => this.getCurrentUser()),
    map((user: IUser) => this.currentUser$.next(user)),
    catchError(transformError)
  )
  protected readonly resumeCurrentUser$ = this.authStatus$.pipe(
    this.getAndUpdateUserIfAuthenticated
  )

  protected getAuthFromToken(): IAuthStatus {
    return this.transformJwtToken(decode(this.getToken()))
  }
  login(email: string, password: string): Observable<void> {
    this.clearToken()
    const loginResponse$ = this.authProvider(email, password).pipe(
      map((value) => {
        this.setToken(value.accessToken)
        const token = decode(value.accessToken)
        return this.transformJwtToken(token)
      }),
      tap((status) => this.authStatus$.next(status)),
      this.getAndUpdateUserIfAuthenticated
    )
    loginResponse$.subscribe({
      error: (err) => {
        this.logout()
        return throwError(() => new Error(err))
      },
    })

    return loginResponse$
  }
  logout(clearToken?: boolean): void {
    if (clearToken) {
      this.clearToken()
    }
    setTimeout(() => this.authStatus$.next(defaultAuthStatus), 0)
  }
  getToken(): string {
    return this.getItem('jwt') ?? ''
  }
  protected setToken(jwt: string) {
    this.setItem('jwt', jwt)
  }
  protected clearToken() {
    this.removeItem('jwt')
  }

  protected hasExpiredToken() {
    const jwt = this.getToken()
    if (jwt) {
      const payload = decode(jwt) as any
      return Date.now() >= payload.expr * 1000
    }
    return true
  }

  protected abstract authProvider(
    email: string,
    password: string
  ): Observable<IServerAuthResponse>

  protected abstract transformJwtToken(token: unknown): IAuthStatus

  protected abstract getCurrentUser(): Observable<IUser>
}
