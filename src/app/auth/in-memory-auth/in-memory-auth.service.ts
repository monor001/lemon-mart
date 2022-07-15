import { Injectable } from '@angular/core'
import { sign } from 'fake-jwt-sign'
import { Observable, of, throwError } from 'rxjs'
import { PhoneType } from 'src/app/user/user/phonetype.enum'
import { User } from 'src/app/user/user/user.im'
import { IUser } from 'src/app/user/user/user.in'

import { IAuthStatus, IServerAuthResponse } from '../auth-status.in'
import { Role } from '../auth.enum'
import { AuthService } from '../auth.service.abstract'

@Injectable()
export class InMemoryAuthService extends AuthService {
  constructor() {
    super()
    console.log('You are using the In Memory Service. Do not use this in production')
  }

  private defaultUser = User.Build({
    _id: '5da01751da27cc462d265913',
    email: 'momo@gmail.com',
    name: {
      first: 'mo',
      last: 'mo',
    },
    role: Role.Manager,
    dateOfBirth: new Date(1988, 1, 1),
    userStatus: true,
    address: {
      line1: '100 Sesame st.',
      city: 'Moon',
      state: 'Lala-Land',
      zip: '2323',
    },
    level: 2,
    phones: [
      {
        id: 0,
        type: PhoneType.Work,
        digits: '34234234',
      },
    ],
    picture: '',
  })

  protected authProvider(
    email: string,
    password: string
  ): Observable<IServerAuthResponse> {
    email = email.toLowerCase()
    if (!email.endsWith('@test.com')) {
      return throwError(
        () => new Error('Failed to login! Email needs to end with @test.com')
      )
    }
    const authStatus = {
      isAuthenticated: true,
      userId: this.defaultUser._id,
      userRole: email.includes('cashier')
        ? Role.Cashier
        : email.includes('clerk')
        ? Role.Clerk
        : email.includes('manager')
        ? Role.Manager
        : Role.None,
    } as IAuthStatus
    this.defaultUser.role = authStatus.userRole
    const authResposne = {
      accessToken: sign(authStatus, 'secret', {
        expiresIn: '1h',
        algorithm: 'none',
      }),
    } as IServerAuthResponse
    return of(authResposne)
  }
  protected transformJwtToken(token: unknown): IAuthStatus {
    throw new Error('Method not implemented.')
  }
  protected getCurrentUser(): Observable<IUser> {
    return of(this.defaultUser)
  }
}
