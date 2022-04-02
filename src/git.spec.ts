import { Git } from './git'

describe('Git', () => {
  describe('isCurrentDirUnderGitControl()', () => {
    it('in Git dir', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((resolve) => resolve('true'))
      })
      const git = new Git()
      // Act
      const res = await git.isCurrentDirUnderGitControl()
      // Assert
      expect(res).toBeTruthy()
    })

    it('outside Git dir', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((resolve) => resolve('fatal: Kein Git-Repository (oder irgendeines der Elternverzeichnisse): .git'))
      })
      const git = new Git()
      // Act
      const res = await git.isCurrentDirUnderGitControl()
      // Assert
      expect(res).toBeFalsy()
    })

    it('error', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((_resolve, reject) => reject('some error'))
      })
      const git = new Git()
      // Act
      const res = await git.isCurrentDirUnderGitControl()
      // Assert
      expect(res).toBeFalsy()
    })
  })

  describe('haveStagedChanges()', () => {
    it('have staged changes', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((resolve) => resolve('the content of the diff'))
      })
      const git = new Git()
      // Act
      const res = await git.haveStagedChanges()
      // Assert
      expect(res).toBeTruthy()
    })

    it('have no staged changes', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((resolve) => resolve(''))
      })
      const git = new Git()
      // Act
      const res = await git.haveStagedChanges()
      // Assert
      expect(res).toBeFalsy()
    })

    it('error', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((_resolve, reject) => reject('some error'))
      })
      const git = new Git()
      // Act
      const res = await git.haveStagedChanges()
      // Assert
      expect(res).toBeFalsy()
    })
  })

  describe('isAtWork()', () => {
    it('is at work', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((resolve) => resolve('origin	git@foo.intra.bender:some-project.git (fetch)'))
      })
      const git = new Git()
      // Act
      const res = await git.isAtWork()
      // Assert
      expect(res).toBeTruthy()
    })

    it('is not at work', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((resolve) => resolve('origin	git@github.com:some-project.git (fetch)'))
      })
      const git = new Git()
      // Act
      const res = await git.isAtWork()
      // Assert
      expect(res).toBeFalsy()
    })

    it('error', async () => {
      // Arrange
      const handleSpy = jest.spyOn(Git.prototype as any, 'execute')
      handleSpy.mockImplementation(() => {
        return new Promise((_resolve, reject) => reject('some error'))
      })
      const git = new Git()
      // Act
      const res = await git.isAtWork()
      // Assert
      expect(res).toBeFalsy()
    })
  })
})
