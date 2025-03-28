// TODO
interface MetaItem {}

interface Response {
  binary(contentType: string, content: number[]): void
  execute(url: string): void
  json(value: any): void
  meta: {
    getMeta(name: string): MetaItem
    setCustomerHeader(headerString: string): void
    setMeta(name: string, value: string): void
    setMeta(
      name: string,
      httpEquiv: string,
      charSet: string,
      content: string
    ): void
    title: string
  }
  redirect(url: string, absolute?: boolean): void
  renderView(viewBody: string): void
  setHeader(key: string, value: string): void
  statusCode(code: number): void
  unauthorized(): void
  write(value: any): void
}

export { Response }
