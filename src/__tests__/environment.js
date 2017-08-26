import fs from 'fs';
import dedent from 'dedent';
import Environment from '../environment';

jest.mock('fs');

const enoentError = () => {
  const error = new Error('No such file or directory');

  error.code = 'ENOENT';

  return error;
}

describe('Environment', () => {
  describe('getDependencies', () => {
    it('should return all project dependencies', async () => {
      fs.readFile.mockImplementationOnce((path, options, callback) => {
        expect(path).toBe('package.json');
        expect(options).toBe('utf-8');

        callback(null, dedent`{
          "dependencies": {
            "lodash": "^3.18.1"
          },
          "devDependencies": {
            "babel": "^5.4.13",
            "eslint": "^8.1.0"
          }
        }`)
      });

      const environment = new Environment();
      const result = await environment.getProjectDependencies();

      expect(result).toEqual([
        'lodash',
        'babel',
        'eslint',
      ]);
    });
  });

  describe('getInstalledModules', () => {
    it('should return all project dependencies', () => {
      fs.readDir.mockImplementationOnce((path, callback) => {
        expect(path).toBe('node_modules');

        callback(null, [
          'lodash',
          'prettier',
        ]);
      });

      const environment = new Environment();
      const result = await environment.getInstalledModules();

      expect(result).toEqual(['lodash', 'prettier']);
      expect.assertions(2);
    });
  });

  describe('getPackageScripts', () => {
    it('should return all package scripts', () => {
      fs.readFile.mockImplementationOnce((path, options, callback) => {
        expect(path).toBe('package.json');

        callback(null, dedent`{
          "scripts": {
            "test": "jest",
            "lint": "eslint",
          },
          `)
        })

      const environment = new Environment();
      const result = environment.getPackageScripts();

      expect(result).toEqual(['test', 'lint']);
      expect.assertions(2);
    });
  });

  describe('pathExists', () => {
    it('returns true when path is accessible', () => {
      fs.access.mockImplementationOnce((path, callback) => {
        expect(path).toBe('foo.js');

        callback(null);
      });

      const environment = new Environment();
      const result = environment.pathExists('foo.js');

      expect(result).toBe(true);
      expect.assertions(2);
    });

    it('returns false when path is unaccessible', () => {
      fs.access.mockImplementationOnce((path, callback) => {
        expect(path).toBe('foo.js');

        callback(enoentError());
      });

      const environment = new Environment();
      const result = environment.pathExists('foo.js');

      expect(result).toBe(false);
      expect.assertions(2);
    });

    it('rethrows unrecognized error', () => {
      fs.access.mockImplementationOnce((path, callback) => {
        expect(path).toBe('foo.js');

        callback(new Error('foo'));
      });

      const environment = new Environment();
      const result = environment.pathExists('foo.js');

      expect(result).toBe(false);
      expect.assertions(2);
    });
  });

  describe('findExecutable', () => {
    it('returns path to find executable', () => {
      process.env.PATH = '/bin';
      fs.access.mockImplementationOnce((path, mode, callback) => {
        expect(path).toEqual('/bin/git');

        callback(new Error('foo'));
      });

      const environment = new Environment();
      const result = await environment.findExecutable('git');

      expect(result).toBe('/bin/git');
    });

    it('returns null when executable can not be found', () => {
      process.env.PATH = '/usr/bin:/usr/local/bin';
      fs.access.mockImplementationOnce((path, mode, callback) => {
        expect(path).toEqual('/usr/bin/git');

        throw new Error('foo');
      });
      fs.access.mockImplementationOnce((path, mode, callback) => {
        expect(path).toEqual('/usr/local/bin/git');

        throw new Error('foo');
      });

      const environment = new Environment();
      const result = await environment.findExecutable('git');

      expect(result).toBe(null);
    });
  });

  describe('isCleanWorkingTree', () => {
    it('returns true when working tree is clean', () => {
      childProcess.exec.mockImplementationOnce((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        callback(null);
      });

      const environment = new Environment();
      const result = environment.isCleanWorkingTree();

      expect(result).toBe(true);
    });

    it('returns false when working tree is dirty', () => {
      childProcess.exec.mockImplementationOnce((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        const error = new Error('Process exitted with status code 1');
        error.code = 1;

        callback(error);
      });

      const environment = new Environment();
      const result = environment.isCleanWorkingTree();

      expect(result).toBe(false);
    });

    it('rethrows unrecognized errors', () => {
      const error = new Error('foo');

      childProcess.exec.mockImplementationOnce((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        callback(error);
      });

      const environment = new Environment();
      const result = environment.isCleanWorkingTree();

      expect(result).rejects.toEqual(error);
    });
  });
})
