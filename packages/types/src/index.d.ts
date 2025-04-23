import { Api } from './k/api'
import { DB } from './k/DB'
import { Cache } from './k/cache'
import { Account } from './k/account'
import { Request } from './k/request'
import { Response } from './k/response'
import { Cookie } from './k/cookie'
import { File } from './k/file'
import { Security } from './k/security'
import { Site } from './k/site'

declare global {
  namespace k {
    const api: Api
    const DB: DB
    const cache: Cache
    const account: Account
    const request: Request
    const response: Response
    const cookie: Cookie
    const file: File
    const security: Security
    const fromSite: (siteIdOrName: string) => typeof k | null
    const site: Site
  }
}

export {}
