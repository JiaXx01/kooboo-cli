import { Api } from './k/api'
import { DB } from './k/DB'
import { Cache } from './k/cache'
import { Account } from './k/account'
import { Request } from './k/request'
import { Response } from './k/response'
import { Cookie } from './k/cookie'

declare global {
  namespace k {
    const api: Api
    const DB: DB
    const cache: Cache
    const account: Account
    const request: Request
    const response: Response
    const cookie: Cookie
  }
}

export {}
