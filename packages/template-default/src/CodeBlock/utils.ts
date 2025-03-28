export function failResponse(message: string, code = 400, data: any) {
  k.response.json({
    code,
    data,
    message
  })
  return k.api.httpCode(code)
}

export function successResponse(data: any) {
  return {
    code: 200,
    data,
    message: 'success'
  }
}
