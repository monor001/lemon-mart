import { PhoneType } from './phonetype.enum'

export interface IPhone {
  type: PhoneType
  digits: string
  id: number
}
