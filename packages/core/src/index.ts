#!/usr/bin/env node
import create from '@kooboo_cli/create'
import { Command } from 'commander'
import fse from 'fs-extra'
import path from 'node:path'

const pkgJson = fse.readJSONSync(
  path.join(import.meta.dirname, '../package.json')
)

const program = new Command()

program.name('kooboo_cli').description('脚手架 cli').version(pkgJson.version)

program
  .command('create')
  .description('创建项目')
  .action(async () => {
    create()
  })

program.parse()
