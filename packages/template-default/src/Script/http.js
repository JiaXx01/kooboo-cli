var http = axios.create({
  // 请求超时时间
  timeout: 15000,
  baseURL: '/'
})

// 添加请求拦截器
http.interceptors.request.use(config => {
  return config
})

// 添加响应拦截器
http.interceptors.response.use(response => {
  // 错误处理
  if (response.data?.code !== 200) {
      return Promise.reject(response.data)
  }
  return response.data
}, error => {
  const rspData = error.response?.data
  const msg = typeof rspData === 'string' ? rspData : rspData.msg
  console.error('response, ', error);
  console.error('请求错误\n' + msg)
  msg && ElMessage.error(msg)
  return Promise.reject(error)
})