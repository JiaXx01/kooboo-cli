interface ApiResponse {}

type ApiAction = (...args: any[]) => any
type ApiResultHandler = (code: number, data: any) => any

interface ApiHandler {
  (action: ApiAction): void
  (action: ApiAction, resultHandler: ApiResultHandler): void
  (path: string, action: ApiAction): void
  (path: string, action: ApiAction, resultHandler: ApiResultHandler): void
}

interface Api {
  badRequest(): ApiResponse
  forbidden(): ApiResponse
  httpCode(code: number): ApiResponse
  // TODO
  isActionMatch(): boolean
  notFound(): ApiResponse
  ok(): ApiResponse
  redirect(url: string): ApiResponse
  unauthorized(): ApiResponse
  get: ApiHandler
  post: ApiHandler
  put: ApiHandler
  patch: ApiHandler
  delete: ApiHandler
}

export { Api }
