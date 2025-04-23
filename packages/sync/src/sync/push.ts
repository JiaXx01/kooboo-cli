import { getTypeAndNameByLocalPath, syncSave, syncDelete } from '../utils.js'

/**
 * 同步代码到指定代码类型
 * @param path 本地文件路径
 * @param code 代码内容
 */
export function execPush(path: string, code: string) {
  const { type, name } = getTypeAndNameByLocalPath(path)

  if (type === 'page' || type === 'api') {
    let url = ''
    if (type === 'page') {
      url = name === 'index' ? '/' : `/${name}`
    } else if (type === 'api') {
      url = `api/${name.split('.').join('/')}/{params}`
    }
    syncSave({
      type,
      name,
      code,
      url
    })
  } else {
    syncSave({
      type,
      name,
      code
    })
  }
}

/**
 * 同步删除指定代码类型
 * @param path 本地文件路径
 */
export function execDelete(path: string) {
  const { type, name } = getTypeAndNameByLocalPath(path)
  syncDelete(type, name)
}
