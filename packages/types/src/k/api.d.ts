interface ApiHandler {
  (path: string, handler: (...args: any[]) => any): void
  (handler: (...args: any[]) => any): void
}

interface Api {
  get: ApiHandler
  post: ApiHandler
  put: ApiHandler
  patch: ApiHandler
  delete: ApiHandler
}

export { Api }
