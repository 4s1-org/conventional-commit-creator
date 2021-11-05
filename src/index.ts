#!/usr/bin/env node

import prompts, { PromptObject } from 'prompts'
import * as fs from 'fs'
import { exec, ExecException } from 'child_process'

const questions: PromptObject[] = [
  {
    type: 'select',
    name: 'type',
    message: 'type?',
    choices: [
      { title: 'fix      - A bugfix', value: 'fix' },
      { title: 'feat     - A new feature', value: 'feat' },
      { title: 'refactor - Refactor code without changing public API', value: 'refactor' },
      { title: 'chore    - Update something without impacting the user', value: 'chore' },
      { title: 'perf     - A code change that improves performance', value: 'perf' },
      { title: 'docs     - Documentation only changes', value: 'docs' },
      { title: 'style    - Code style change (semicolon, indentation, ...)', value: 'style' },
      { title: 'test     - Modify any test', value: 'test' },
      { title: 'build    - Changes that affect the build system (grunt, npm, ...)', value: 'build' },
      { title: 'ci       - Changes to our CI configuration files and scripts (gitlab, git, ...)', value: 'ci' },
      { title: 'revert   - Reverts a previous commit', value: 'revert' },
    ],
  },
  {
    type: 'text',
    name: 'scope',
    message: 'scope?',
    validate: (value: string) => {
      if (value.length > 30) {
        return `Your text is ${value.length - 30} char(s) too long.`
      } else {
        return true
      }
    },
  },
  {
    type: 'text',
    name: 'description',
    message: 'description?',
    validate: (value: string) => {
      if (value.length > 80) {
        return `Your text is ${value.length - 80} char(s) too long.`
      } else if (value.length < 3) {
        return `Your text is ${3 - value.length} char(s) too short.`
      } else if (value[0] === value[0].toUpperCase()) {
        return `First char must be in lower case.`
      } else {
        return true
      }
    },
  },
  {
    type: 'number',
    name: 'issue',
    message: 'issue?',
  },
]

async function main() {
  const gitRootPath = await getGitRootPath()

  if (!(await haveStagedChanges())) {
    console.error('Nothing to commit')
    process.exit(0)
  }

  const data = await prompts(questions, {
    onCancel: () => {
      console.error('Aborted')
      process.exit(1)
    },
  })

  const isGitSvn = await checkIsGitSvn(gitRootPath)
  const msg = createMsg(data, isGitSvn)
  await commit(msg)
  console.info('done')
}

function createMsg(data: any, isGitSvn: boolean): string {
  let msg = `${data.type.trim()}`

  if (data.scope) {
    msg += `(${data.scope.trim()})`
  }

  msg += `: ${data.description.trim()}`

  if (data.issue) {
    if (isGitSvn) {
      msg += ` (refs #${data.issue})`
    } else {
      msg += ` (#${data.issue})`
    }
  }

  return msg
}

async function commit(msg: string): Promise<void> {
  console.info('committing ...')
  try {
    await execute(`git commit -m "${msg}"`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

async function haveStagedChanges(): Promise<boolean> {
  try {
    const staged = await execute('git diff --cached')
    return staged !== ''
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

async function getGitRootPath(): Promise<string> {
  try {
    const path = await execute('git rev-parse --show-toplevel')
    return path.trim()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

async function checkIsGitSvn(gitRootPath: string): Promise<boolean> {
  const fullPath = `${gitRootPath}/.git/svn`
  const res = fs.existsSync(fullPath)
  return res
}

async function execute(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err: ExecException | null, stdout: string) => {
      if (err) {
        reject(err)
        return
      }
      resolve(stdout)
    })
  })
}

main().catch(console.error)
