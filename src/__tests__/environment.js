import fs from 'fs';
import dedent from 'dedent';
import Environment from '../environment';

jest.mock('fs');

describe('Environment', () => {
  const environment = new Environment();

  describe.skip('getDependencies', () => {
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

      expect(result).toEqual({
        lodash: '^3.18.1',
        babel: '^5.4.13',
        eslint: '^8.1.0',
      });
    });
  });

  describe.skip('getInstalledModules', () => {
    it('should return all installed modules', async () => {
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

  describe.skip('getPackageScripts', () => {
    it('should return all package scripts', async () => {
      fs._mockFileContentsOnce('package.json', dedent`{
        "scripts": {
          "test": "jest",
          "lint": "eslint",
        },
      `);
      // fs.readFile.mockImplementationOnce((path, options, callback) => {
      //   expect(path).toBe('package.json');

      //   callback(null, )
      //   })

      const environment = new Environment();
      const result = await environment.getPackageScripts();

      expect(result).toEqual(['test', 'lint']);
      expect.assertions(2);
    });
  });

  describe.skip('pathExists', () => {
    it('returns true when path is accessible', async () => {
      fs.access.mockImplementationOnce((path, callback) => {
        expect(path).toBe('foo.js');

        callback(null);
      });

      const environment = new Environment();
      const result = await environment.pathExists('foo.js');

      expect(result).toBe(true);
      expect.assertions(2);
    });

    it('returns false when path is unaccessible', async () => {
      fs.access.mockImplementationOnce((path, callback) => {
        expect(path).toBe('foo.js');

        callback(fs._enoentError());
      });

      const environment = new Environment();
      const result = await environment.pathExists('foo.js');

      expect(result).toBe(false);
      expect.assertions(2);
    });

    it('rethrows unrecognized error', async () => {
      fs.access.mockImplementationOnce((path, callback) => {
        expect(path).toBe('foo.js');

        callback(new Error('foo'));
      });

      const environment = new Environment();
      const result = await environment.pathExists('foo.js');

      expect(result).toBe(false);
      expect.assertions(2);
    });
  });

  describe.skip('findExecutable', () => {
    it('returns path to find executable', async () => {
      process.env.PATH = '/bin';
      fs.access.mockImplementationOnce((path, mode, callback) => {
        expect(path).toEqual('/bin/git');

        callback(new Error('foo'));
      });

      const environment = new Environment();
      const result = await environment.findExecutable('git');

      expect(result).toBe('/bin/git');
    });

    it('returns null when executable can not be found', async () => {
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

  describe.skip('isCleanWorkingTree', () => {
    it('returns true when working tree is clean', async () => {
      childProcess.exec.mockImplementationOnce((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        callback(null);
      });

      const environment = new Environment();
      const result = await environment.isCleanWorkingTree();

      expect(result).toBe(true);
    });

    it('returns false when working tree is dirty', async () => {
      childProcess.exec.mockImplementationOnce((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        const error = new Error('Process exitted with status code 1');
        error.code = 1;

        callback(error);
      });

      const environment = new Environment();
      const result = await environment.isCleanWorkingTree();

      expect(result).toBe(false);
    });

    it('rethrows unrecognized errors', async () => {
      const error = new Error('foo');

      childProcess.exec.mockImplementationOnce((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        callback(error);
      });

      const environment = new Environment();
      const result = await environment.isCleanWorkingTree();

      expect(result).rejects.toEqual(error);
    });
  });

  describe('findEslintrc', () => {
    it('returns null if no configuration file exists', async () => {
      const result = await environment.findEslintrc();

      expect(result).toBe(null);
    });

    it('returns null if package.json does not contain eslintConfig section', async () => {
      fs._mockFileAccessOnce('package.json');
      fs._mockFileContentsOnce('package.json', dedent`{
        "name": "Foo"
      }`);

      const result = await environment.findEslintrc();

      expect(result).toBe(null);
    });

    it('returns package.json when it contains eslintConfig section', async () => {
      fs._mockFileAccessOnce('package.json');
      fs._mockFileContentsOnce('package.json', dedent`{
        "eslintConfig": {}
      }`);

      const result = await environment.findEslintrc();

      expect(result).toBe('package.json');
    });

    it('returns .eslintrc when no higher priority file exists', async () => {
      fs._mockFileAccessOnce('.eslintrc');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc');
    });

    it('returns .eslintrc.json when no higher priority file exists', async () => {
      fs._mockFileAccessOnce('.eslintrc.json');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.json');
    });

    it('returns .eslintrc.yml when no higher priority file exists', async () => {
      fs._mockFileAccessOnce('.eslintrc.yml');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.yml');
    });

    it('returns .eslintrc.yaml when no higher priority file exists', async () => {
      fs._mockFileAccessOnce('.eslintrc.yaml');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.yaml');
    });

    it('returns .eslintrc.js when it exists', async () => {
      fs._mockFileAccessOnce('.eslintrc.js');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.js');
    });
  });
});
