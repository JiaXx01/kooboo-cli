import fs from 'node:fs'
import fse from 'fs-extra'
// @ts-ignore
import npminstall from 'npminstall'
import { getLatestVersion, getNpmRegistry } from './versionUtils.js'
import path from 'node:path'

export interface NpmPackageOptions {
  name: string
  targetPath: string
}

class NpmPackage {
  name: string
  version: string = ''
  targetPath: string
  storePath: string

  constructor(options: NpmPackageOptions) {
    this.targetPath = options.targetPath
    this.name = options.name

    this.storePath = path.resolve(options.targetPath, 'node_modules')
  }

  async prepare() {
    if (!fs.existsSync(this.targetPath)) {
      fse.mkdirpSync(this.targetPath)
    }
    const version = await getLatestVersion(this.name)
    this.version = version
  }

  async install() {
    await this.prepare()

    return npminstall({
      pkgs: [
        {
          name: this.name,
          version: this.version
        }
      ],
      registry: getNpmRegistry(),
      root: this.targetPath
    })
  }

  get npmFilePath() {
    return path.resolve(
      this.storePath,
      `.store/${this.name.replace('/', '+')}@${this.version}/node_modules/${
        this.name
      }`
    )
  }

  async exists() {
    await this.prepare()

    return fs.existsSync(this.npmFilePath)
  }

  async getPackageJSON() {
    if (await this.exists()) {
      return fse.readJsonSync(path.resolve(this.npmFilePath, 'package.json'))
    }
    return null
  }

  async getLatestVersion() {
    return getLatestVersion(this.name)
  }

  async update() {
    const latestVersion = await this.getLatestVersion()
    return npminstall({
      root: this.targetPath,
      registry: getNpmRegistry(),
      pkgs: [
        {
          name: this.name,
          version: latestVersion
        }
      ]
    })
  }
}

export default NpmPackage
