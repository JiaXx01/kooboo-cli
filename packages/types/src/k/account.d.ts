/**
 * CreditCard
 */
// TODO
interface CreditCard {}

/**
 * OAuth
 */
// TODO
interface AuthenticationResult {}

interface OAuth {
  activeDirectory: {
    getToken(
      resource: string,
      clientId: string,
      secret: string,
      tenantId: string
    ): AuthenticationResult
  }
  apple: {
    callback(query: any)
    getAuthUrl(params: any)
    getToken(params: any)
  }
  // TODO
  builtIn: {}
  facebook: {
    getAuthUrl(): string
  }
  google: {
    getAuthUrl(): string
  }
  weChat: {
    getAuthJson(params: any): string
    getAuthUrl(): string
  }
  weibo: {
    getAuthUrl(): string
  }
}

/**
 * Organization
 */
// TODO
interface OrganizationModel {
  users: UserModel[]
}

interface Organization {
  current: OrganizationModel
  get(nameOrId: string): OrganizationModel
}

/**
 * Server
 */
// TODO
interface WebSite {}
// TODO
interface OrgServerHostModel {}
// TODO
interface SimpleSiteItemViewModel {}

interface Server {
  createSite(siteName: string, fullDomain: string, serverUrl: string): WebSite
  list(): OrgServerHostModel[]
  sites(): SimpleSiteItemViewModel[]
}

/**
 * Subscription
 */
// TODO
interface SubscriptionModel {}

interface Subscription {
  cancel(id: string): SubscriptionModel
  checkStatus(id: string): SubscriptionModel
  get(id: string): SubscriptionModel
  list(): SubscriptionModel[]
  subscribe(id: string): SubscriptionModel
}

/**
 * ThirdPartyLogin
 */
// TODO
interface ThirdPartyLoginInfo {}

/**
 * WeCharPay
 */
// TODO
interface WeChatChargeModel {}

interface WeCharPay {
  charge(model: WeChatChargeModel): string
  checkStatus(orderId: string): boolean
}

/**
 * User
 */
// TODO
interface UserModel {
  id: string
  currentOrgId: string
  currentOrgName: string
  isAdmin: boolean
  userName: string
  emailAddress: string
  email: string
  isEmailVerified: boolean
  isTelVerified: boolean
  tel: string | null
  twoFAMethod: string | null
  otpSecret: string | null
  password: string
  passwordHash: string
  firstName: string | null
  lastName: string | null
  fullName: string
  language: string
  registerIp: string
  tempRedirectUrl: string | null
  oneTimeToken: string
  currency: string | null
  registrationDate: string
  lastModified: string
}

// TODO
interface DepartmentModel {}

interface UserCurrent {
  changePassword(oldPassword: string, newPassword: string): boolean
  currentOrgId: string
  departments: DepartmentModel[]
  email: string
  firstName: string
  id: string
  isAdmin: boolean
  language: string
  lastName: string
  organizations: OrganizationModel[]
  phone: string
  userName: string
}

interface User {
  changeOrganization(organizationName: string): UserModel
  current: UserCurrent
  email: string
  emailExists(email: string): boolean
  ensureLogin(redirectUrl: string): void
  exists(userName: string): boolean
  firstName: string
  get(userName: string): UserModel
  id: string
  isLogin: boolean
  isOfOrganization(organizationName: string): boolean
  language: string
  lastName: string
  login(userName: string, password: string): UserModel
  logout(): void
  userName: string
}

interface Account {
  creditCard: CreditCard
  ensureLogin(redirectUrl: string): void
  generateToken(userName: string, expireIn: number): string
  isLogin: boolean
  loginOrganization(username: string, password: string): UserModel
  logout(): UserModel
  membership: {
    addMembership(nameOrId: string, level: number, endDate: Date): void
  }
  oAuth: OAuth
  organization: Organization
  server: Server
  setIdentify(token: string): void
  subscription: Subscription
  thirdPartyLogin(thirdPartyName: string, userName: string): ThirdPartyLoginInfo
  weCharPay: WeCharPay
  user: User
}

export { Account }
