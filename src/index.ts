#!/usr/bin/env node

// @ts-ignore
import prompts, { PromptObject } from 'prompts'
import { $ } from 'zx'
import * as fs from 'fs'

$.verbose = false

const questions: PromptObject[] = [
  {
    type: 'select',
    name: 'type',
    message: 'type?',
    // https://github.com/pvdlg/conventional-commit-types
    choices: [
      { title: '✨ feat - A new feature', value: 'feat' },
      { title: '🐛 fix - A bug Fix', value: 'fix' },
      { title: '🚀 perf - A code change that improves performance', value: 'perf' },
      { title: '📚 docs - Documentation only changes', value: 'docs' },
      { title: '💎 style - Code style change (semicolon, indentation...)', value: 'style' },
      { title: '📦 refactor - Refactor code without changing public API', value: 'refactor' },
      { title: '🚨 test - Add test to an existing feature', value: 'test' },
      { title: '🛠 build - Changes that affect the build system', value: 'build' },
      { title: '⚙️ ci - Changes to our CI configuration files and scripts', value: 'ci' },
      { title: '♻️ chore - Update something without impacting the user', value: 'chore' },
      { title: '🗑 revert - Reverts a previous commit', value: 'revert' },
    ],
  },
  {
    type: 'text',
    name: 'scope',
    message: 'scope?',
    validate: (value: string) => {
      if (value.length > 20) {
        return `Your text is ${value.length - 20} char(s) too long`
      } else {
        return true
      }
    },
  },
  {
    type: 'text',
    name: 'body',
    message: 'body?',
    validate: (value: string) => {
      if (value.length > 80) {
        return `Your text is ${value.length - 80} char(s) too long`
      } else if (value.length < 3) {
        return `Your text is ${3 - value.length} char(s) too short`
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
  const staged = await $`git diff --cached`
  if (!staged.stdout) {
    console.error('Nothing to commit')
    process.exit(1)
  }

  const res = await prompts(questions)
  let msg = `${res.type}`
  if (res.scope) {
    msg += `(${res.scope})`
  }
  msg += `: ${res.body}`
  if (res.issue) {
    let refsText = ''
    const gitSvn = await isGitSvn()
    if (gitSvn) {
      refsText = 'refs '
    }
    msg += ` (${refsText}#${res.issue})`
  }

  await $`git commit -m ${msg}`
}

async function isGitSvn(): Promise<boolean> {
  const path = await $`git rev-parse --show-toplevel`
  const fullPath = `${path.stdout.trim()}/.git/svn`
  const res = fs.existsSync(fullPath)
  return res
}

main().catch(console.error)
