#!/usr/bin/env node
import create from '@jx-cli/create'
import { Command } from 'commander'
import fse from 'fs-extra'
import path from 'node:path'

const pkgJson = fse.readJSONSync(
  path.join(import.meta.dirname, '../package.json')
)

const program = new Command()

program.name('jx-cli').description('脚手架 cli').version(pkgJson.version)

program
  .command('create')
  .description('创建项目')
  .action(async () => {
    try {
      await create()
    } catch (error) {
      console.error('创建项目失败:', error)
      process.exit(1)
    }
  })

program.parse()
