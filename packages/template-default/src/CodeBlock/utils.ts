export function failResponse(message, code = 400, data) {
  k.response.json({
      code,
      data,
      message
  })
  return k.api.httpCode(code)
}

export function successResponse(data) {
  return {
      code: 200,
      data,
      message: 'success'
  }
}