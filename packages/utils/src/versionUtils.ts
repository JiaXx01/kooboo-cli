import axios from 'axios'
import urlJoin from 'url-join'

function getNpmRegistry() {
  return 'https://registry.npmmirror.com'
}

async function getNpmInfo(packageName: string) {
  const register = getNpmRegistry()
  const url = urlJoin(register, packageName)
  try {
    const response = await axios.get(url)

    if (response.status === 200) {
      return response.data
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getLatestVersion(packageName: string) {
  const data = await getNpmInfo(packageName)
  return data['dist-tags'].latest
}

async function getVersions(packageName: string) {
  const data = await getNpmInfo(packageName)
  return Object.keys(data.versions)
}

export { getNpmRegistry, getNpmInfo, getLatestVersion, getVersions }
