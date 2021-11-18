#!/usr/bin/env node

import prompts, { PromptObject } from 'prompts'
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
      { title: 'style    - Code style (semicolon, indentation, white-space, formatting, ...)', value: 'style' },
      { title: 'test     - add/change/delete tests', value: 'test' },
      { title: 'build    - build system (npm, git, VSCode, husky, tsconfig, ...)', value: 'build' },
      { title: 'ci       - CI configuration (GitLab, RenovateBot, ...)', value: 'ci' },
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

  const msg = createMsg(data)
  await commit(msg)
  console.info('done')
}

function createMsg(data: any): string {
  let msg = `${data.type.trim()}`

  if (data.scope) {
    msg += `(${data.scope.trim()})`
  }

  msg += `: ${data.description.trim()}`

  if (data.issue) {
    msg += ` #${data.issue}`
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
