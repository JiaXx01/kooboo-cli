import axios from 'axios'

/**
 * 根据文件路径提取类型和名称
 * @param path 本地文件路径
 * @returns 包含类型和名称的对象
 */
export function getTypeAndNameByLocalPath(path: string): {
  type: ResourceType
  name: string
} {
  if (path.startsWith('Script/')) {
    const scriptPathRegex = /^Script\/(.+)\.js$/
    const match = path.match(scriptPathRegex)
    if (match) {
      return {
        type: 'script',
        name: match[1].split('/').join('.') + '.js'
      }
    }
  } else if (path.startsWith('Style/')) {
    const stylePathRegex = /^Style\/(.+)\.css$/
    const match = path.match(stylePathRegex)
    if (match) {
      return {
        type: 'style',
        name: match[1].split('/').join('.') + '.css'
      }
    }
  }
  const pathArr = path.replace(/\.\w+$/, '').split('/')
  const type = pathArr[0].toLowerCase() as ResourceType
  return {
    type,
    name: pathArr.slice(1).join('.')
  }
}

/**
 * 同步请求实例
 */
const syncRequest = axios.create()

syncRequest.interceptors.response.use(
  response => {
    if (response.status === 200) {
      console.log(response.data?.message)
      return response.data
    } else {
      console.error('同步请求失败', response.data)
    }
  },
  reject => {
    console.error('同步请求失败')
  }
)

export function setSyncRequest({
  remoteSiteUrl,
  token
}: {
  remoteSiteUrl: string
  token: string
}) {
  syncRequest.defaults.baseURL = remoteSiteUrl
  syncRequest.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

type ResourceType =
  | 'view'
  | 'style'
  | 'script'
  | 'layout'
  | 'page'
  | 'codeblock'
  | 'api'

/**
 * 同步保存本地代码到站点
 */
type SyncSaveData =
  | {
      type: Exclude<ResourceType, 'page' | 'api'>
      name: string
      code: string
    }
  | {
      type: 'page' | 'api'
      name: string
      code: string
      url: string // 当type为'page'或'api'时，url必填
    }

export function syncSave(data: SyncSaveData) {
  return syncRequest.post('/_site_import_helper/api/__import', data)
}

/**
 * 同步删除站点代码
 */
export function syncDelete(type: string, name: string) {
  return syncRequest.post('/_site_import_helper/api/__import', {
    isDelete: true,
    type,
    name
  })
}

/**
 * 同步加载站点代码到本地
 */
export function syncLoad() {}
