interface Request {
  queryString: Record<string, string>
  form: Record<string, string>
  body: Record<string, any>
  model: any
  culture: string
  method: string
  clientIp: string
  headers: Record<string, string>
  url: string
  host: string
  page: any
}

export { Request }
