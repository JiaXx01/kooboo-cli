import axios from 'axios'

export async function checkAuth(username: string, password: string) {
  try {
    const res = await axios.get('https://kooboo.cn/_api/v2/cli/GenerateToken', {
      params: {
        username,
        password
      }
    })
    return {
      success: true,
      data: res.data as { token: string; expireAt: number; serverUrl: string }
    }
  } catch (error) {
    return { success: false }
  }
}
