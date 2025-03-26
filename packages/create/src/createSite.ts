import axios from 'axios'

interface CreateKoobooSiteOptions {
    siteName: string,
    token: string,
    serverUrl: string
}

interface CreateKoobooSiteResult {
    success: boolean,
    data: {
        siteId: string,
        siteUrl: string,
        modules: string[]
    } | any
}

interface InstallModuleOptions {
    siteUrl: string,
    token: string,
    moduleName: string
}

interface InstallModuleResult {
    success: boolean,
    data: {
        moduleUrl: string
    }
}

interface SetUnocssOptions {
    siteUrl: string,
    token: string
}


const DEFAULT_MODULES = ['sqlite_orm_v2', 'site_import_helper']
const DEFAULT_UNOCCSS_CONFIG = {
    "Enable": true,
    "DisableSsr": false,
    "ResetStyle": false,
    "Config": "{\"rules\": [[\"m-1\", { \"margin\": \"0.25rem\" }]]}"
}

// kooboo 创建站点
export const createKoobooSite = async (options: CreateKoobooSiteOptions) => {
    const { siteName, token, serverUrl } = options
    const response = await axios.get(
        `${serverUrl}/_api/v2/cli/CreateSite`,
        {
            params: { name: siteName },
            headers: { Authorization: `Bearer ${token}` }
        }
    )

    let result: CreateKoobooSiteResult
    if (response.status === 200) {
        const siteInfo = response.data
        if (siteInfo.siteUrl.endsWith('/')) {
            siteInfo.siteUrl = siteInfo.siteUrl.slice(0, -1)
        }
        // 安装默认模块
        const modules = []
        for (let i = 0; i < DEFAULT_MODULES.length; i++) {
            const moduleName = DEFAULT_MODULES[i];
            const res = await installModule({ siteUrl: siteInfo.siteUrl, token, moduleName })
            // 安装失败
            if (!res.success) {
                result = { success: false, data: res.data }
                break
            }
            modules.push(res.data.moduleUrl)
        }
        // 设置Unocss
        const unocssRes = await setUnocss({ siteUrl: siteInfo.siteUrl, token, })

        result = {
            success: true,
            data: {
                siteId: response.data.id,
                siteUrl: response.data.siteUrl,
                modules,

            }
        }
    } else {
        result = {
            success: false,
            data: response.data
        }
    }
    return result
}

// 安装 module
export const installModule = async (options: InstallModuleOptions) => {
    const { siteUrl, token, moduleName } = options
    const response = await axios.get(
        `${siteUrl}/_api/v2/cli/InstallModule`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { name: moduleName }
        }
    )

    let result: InstallModuleResult
    if (response.status === 200) {
        result = {
            success: true,
            data: {
                moduleUrl: response.data.moduleUrl
            }
        }
    } else {
        result = {
            success: false,
            data: response.data
        }
    }
    return result
}

// 设置Unocss
export const setUnocss = async (options: SetUnocssOptions) => {
    const { siteUrl, token } = options
    const response = await axios.post(
        `${siteUrl}/_api/v2/cli/UpdateUnocss`,
        {
            ...DEFAULT_UNOCCSS_CONFIG,
        },
        {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
    )
}

