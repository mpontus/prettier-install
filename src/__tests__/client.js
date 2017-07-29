const fs = require('fs');
const childProcess = require('child_process');
const Client = require('../client');
const dedent = require('dedent');

jest.mock('fs');
jest.mock('child_process');

describe('Client', () => {
  beforeEach(() => {
    fs.__resetMocks();
  });

  describe('detectUncommittedChanges', () => {
    it('must run shell snippet', () => {
      const client = new Client();

      client.detectUncommittedChanges();

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'git diff-index --quiet HEAD --'],
        { stdio: 'inherit' },
      );
    });

    it('must return false when process exits successfuly', async () => {
      const client = new Client();

      childProcess.spawn.mockImplementationOnce(
        () => ({
          on: (event, callback) => event === 'exit' && callback(0),
        })
      )

      const result = await client.detectUncommittedChanges();

      expect(result).toBe(false);
    });

    it('must return true when process exits with non-zero exit code',
      async () => {
        const client = new Client();

        childProcess.spawn.mockImplementationOnce(
          () => ({
            on: (event, callback) => event === 'exit' && callback(1),
          })
        )

        const result = await client.detectUncommittedChanges();

        expect(result).toBe(true);
      }
    );
  })

  describe('installPrettier', () => {
    it('must run the supplied shell command', async () => {
      const client = new Client();

      await client.installPrettier('foo bar');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'foo bar'],
        { stdio: 'inherit' },
      );
    });
  });

  describe('addPrettierCommand', () => {
    it('must add prettier command to package.json', async () => {
      const client = new Client();

      fs.__setMockFile(
        'package.json',
        dedent`{
          "name": "foo-package",
          "scripts": {
            "test": "jest"
          }
        }`
      );

      await client.addPrettierCommand('foo');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
          "name": "foo-package",
          "scripts": {
            "test": "jest",
            "prettier": "prettier --write foo"
          }
        }`,
        expect.any(Function),
      )
    });

    it('must preserve indentation', async () => {
      const client = new Client();

      fs.__setMockFile(
        'package.json',
        dedent`{
            "name": "foo-package",
            "scripts": {
                "test": "jest"
            }
        }`
      );

      await client.addPrettierCommand('foo');

      expect(fs.writeFile).toHaveBeenCalledWith(
        'package.json',
        dedent`{
            "name": "foo-package",
            "scripts": {
                "test": "jest",
                "prettier": "prettier --write foo"
            }
        }`,
        expect.any(Function),
      )
    });
  });

  describe('runPrettier', () => {
    it('must run prettier using supplied command', async () => {
      const client = new Client();

      await client.runPrettier('foo bar');

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'foo bar'],
        { stdio: 'inherit' },
      );
    })
  });

  describe('commitChanges', () => {
    it('must run prettier using supplied command', async () => {
      const client = new Client();

      await client.commitChanges();

      expect(childProcess.spawn).toHaveBeenCalledWith(
        '/bin/sh',
        ['-c', 'git commit --all --edit --message "Installed prettier"'],
        { stdio: 'inherit' },
      );
    })
  });
});
