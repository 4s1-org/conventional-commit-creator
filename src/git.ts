import { exec, ExecException } from 'child_process'

export class Git {
  public async isCurrentDirUnderGitControl(): Promise<boolean> {
    try {
      const result = await this.execute('git rev-parse --is-inside-work-tree')
      return result.trim() === 'true'
    } catch (err) {
      console.error(err)
      return false
    }
  }

  public async haveStagedChanges(): Promise<boolean> {
    try {
      const staged = await this.execute('git diff --cached')
      return staged !== ''
    } catch (err) {
      console.error(err)
      console.log('return false')
      return false
    }
  }

  public async isAtWork(): Promise<boolean> {
    try {
      const output = await this.execute('git remote -v')
      return output.includes('intra.bender:')
    } catch (err) {
      console.error(err)
      return false
    }
  }

  public async commit(msg: string): Promise<void> {
    console.info('committing ...')
    try {
      await this.execute(`git commit -m "${msg}"`)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }

  private execute(cmd: string): Promise<string> {
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
}
