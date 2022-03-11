#!/usr/bin/env node

import prompts, { PromptObject } from 'prompts'
import { Git } from './git'

type promptType = {
  type: string
  scope?: string
  description: string
  issue?: number
}

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
    validate: (value: string): string | boolean => {
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
    validate: (value: string): string | boolean => {
      if (value.length > 80) {
        return `Your text is ${value.length - 80} char(s) too long.`
      } else if (value.length < 3) {
        return `Your text is ${3 - value.length} char(s) too short.`
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

async function main(): Promise<void> {
  const git = new Git()

  if (!(await git.isCurrentDirUnderGitControl())) {
    console.error('Current directory is not a git repository.')
    process.exit(0)
  }

  if (!(await git.haveStagedChanges())) {
    console.error('Nothing to commit')
    process.exit(0)
  }

  const data = (await prompts(questions, {
    onCancel: () => {
      console.error('Aborted')
      process.exit(1)
    },
  })) as promptType

  const isAtWork = await git.isAtWork()
  const msg = await createMsg(data, isAtWork)
  await git.commit(msg)
  console.info('done')
}

async function createMsg(data: promptType, isWork: boolean): Promise<string> {
  let msg = `${data.type.trim()}`

  if (data.scope) {
    msg += `(${data.scope.trim()})`
  }

  msg += `: ${data.description.trim()}`

  if (data.issue) {
    // Hack to support Redmine ticket linking at work.
    if (!isWork) {
      msg += ` (#${data.issue})`
    } else {
      msg += ` [refs #${data.issue}]`
    }
  }

  return msg
}

main().catch(console.error)
