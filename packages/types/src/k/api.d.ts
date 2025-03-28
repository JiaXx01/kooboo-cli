interface ApiResponse {}

interface ApiHandler {
  (path: string, handler: (...args: any[]) => any): void
  (handler: (...args: any[]) => any): void
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
