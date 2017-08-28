import fs from 'fs';
import childProcess from 'child_process';
import dedent from 'dedent';
import Environment from '../environment';

jest.mock('fs');
jest.mock('child_process');

describe('Environment', () => {
  const environment = new Environment();

  beforeEach(() => {
    fs._mockReset();
  })

  describe('getDependencies', () => {
    it('returns empty object when package.json does not exist', async () => {
      const result = await environment.getProjectDependencies();

      expect(result).toEqual({});
    });

    it('returns empty object when package.json does not contain any dependencies', async () => {
      fs._mockFileContents('package.json', dedent`{
        "name": "Foobar"
      }`);

      const result = await environment.getProjectDependencies();

      expect(result).toEqual({});
    });

    it('should return all project dependencies', async () => {
      fs._mockFileContents('package.json', dedent`{
        "dependencies": {
          "lodash": "^3.18.1"
        },
        "devDependencies": {
          "babel": "^5.4.13",
          "eslint": "^8.1.0"
        }
      }`);

      const result = await environment.getProjectDependencies();

      expect(result).toEqual({
        lodash: '^3.18.1',
        babel: '^5.4.13',
        eslint: '^8.1.0',
      });
    });
  });

  describe('getInstalledModules', () => {
    it('should return all installed modules', async () => {
      fs._mockDirContents('node_modules', ['lodash', 'prettier']);

      const result = await environment.getInstalledModules();

      expect(result).toEqual(['lodash', 'prettier']);
    });
  });

  describe('getPackageScripts', () => {
    it('returns empty object when package.json does not exist', async () => {
      const result = await environment.getProjectDependencies();

      expect(result).toEqual({});
    });

    it('returns empty object when package.json does not contain any scripts', async () => {
      fs._mockFileContents('package.json', dedent`{
        "name": "Foobar"
      }`);

      const result = await environment.getProjectDependencies();

      expect(result).toEqual({});
    });

    it('should return all package scripts', async () => {
      fs._mockFileContents('package.json', dedent`{
        "scripts": {
          "test": "jest",
          "lint": "eslint"
        }
      }`);

      const result = await environment.getPackageScripts();

      expect(result).toEqual({
        test: 'jest',
        lint: 'eslint',
      });
    });
  });

  describe('pathExists', () => {
    it('returns false when path is unaccessible', async () => {
      const result = await environment.pathExists('foo.js');

      expect(result).toBe(false);
    });

    it('returns true when path is accessible', async () => {
      fs._mockFileAccess('foo.js');

      const result = await environment.pathExists('foo.js');

      expect(result).toBe(true);
    });
  });

  describe('findExecutable', () => {
    it('returns null when executable can not be found', async () => {
      process.env.PATH = '/usr/bin:/usr/local/bin';

      const result = await environment.findExecutable('git');

      expect(result).toBe(null);
    });

    it('returns path to the found executable', async () => {
      process.env.PATH = '/usr/bin:/usr/local/bin';
      fs._mockFileAccess('/usr/local/bin/git', fs.constants.X_OK);

      const result = await environment.findExecutable('git');

      expect(result).toBe('/usr/local/bin/git');
    });

    it('returns false when none of the found files can be executed', async () => {
      process.env.PATH = '/usr/bin';
      fs._mockFileAccess('/usr/bin/git', fs.constants.R_OK);

      const result = await environment.findExecutable('git');

      expect(result).toBe(null);
    })
  });

  describe('isCleanWorkingTree', () => {
    it('returns true when working tree is clean', async () => {
      childProcess.exec.mockImplementation((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        callback(null);
      });

      const environment = new Environment();
      const result = await environment.isCleanWorkingTree();

      expect(result).toBe(true);
    });

    it('returns false when working tree is dirty', async () => {
      childProcess.exec.mockImplementation((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        const error = new Error('Process exitted with status code 1');
        error.code = 1;

        callback(error);
      });

      const environment = new Environment();
      const result = await environment.isCleanWorkingTree();

      expect(result).toBe(false);
    });

    it('rethrows unrecognized errors', () => {
      const error = new Error('foo');

      childProcess.exec.mockImplementation((command, callback) => {
        expect(command).toBe('git diff-index --quiet HEAD --')

        callback(error);
      });

      const environment = new Environment();
      const result = environment.isCleanWorkingTree();

      return expect(result).rejects.toBe(error);
    });
  });

  describe('findEslintrc', () => {
    it('returns null if no configuration file exists', async () => {
      const result = await environment.findEslintrc();

      expect(result).toBe(null);
    });

    it('returns null if package.json does not contain eslintConfig section', async () => {
      fs._mockFileAccess('package.json');
      fs._mockFileContents('package.json', dedent`{
        "name": "Foo"
      }`);

      const result = await environment.findEslintrc();

      expect(result).toBe(null);
    });

    it('returns package.json when it contains eslintConfig section', async () => {
      fs._mockFileAccess('package.json');
      fs._mockFileContents('package.json', dedent`{
        "eslintConfig": {}
      }`);

      const result = await environment.findEslintrc();

      expect(result).toBe('package.json');
    });

    it('returns .eslintrc when no higher priority file exists', async () => {
      fs._mockFileAccess('.eslintrc');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc');
    });

    it('returns .eslintrc.json when no higher priority file exists', async () => {
      fs._mockFileAccess('.eslintrc.json');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.json');
    });

    it('returns .eslintrc.yml when no higher priority file exists', async () => {
      fs._mockFileAccess('.eslintrc.yml');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.yml');
    });

    it('returns .eslintrc.yaml when no higher priority file exists', async () => {
      fs._mockFileAccess('.eslintrc.yaml');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.yaml');
    });

    it('returns .eslintrc.js when it exists', async () => {
      fs._mockFileAccess('.eslintrc.js');

      const result = await environment.findEslintrc();

      expect(result).toBe('.eslintrc.js');
    });
  });

  describe('eslintPresets', () => {
    it('should throw error when no supported eslint config is found', () => {
      const result = environment.eslintPresets();

      return expect(result).rejects.toEqual(expect.any(Error));
    });

    it('should return single preset from .eslintrc.json', async () => {
      fs._mockFileAccess('.eslintrc.json');
      fs._mockFileContents('.eslintrc.json', dedent`{
        "extends": "foo"
      }`);

      const result = await environment.eslintPresets();

      return expect(result).toEqual(['foo']);
    });

    it('should return presets from .eslintrc.json', async () => {
      fs._mockFileAccess('.eslintrc.json');
      fs._mockFileContents('.eslintrc.json', dedent`{
        "extends": ["foo", "bar"]
      }`)

      const result = await environment.eslintPresets();

      expect(result).toEqual(['foo', 'bar']);
    });

    it('should return presets from package.json', async () => {
      fs._mockFileAccess('package.json');
      fs._mockFileContents('package.json', dedent`{
        "eslintConfig": {
          "extends": ["foo", "bar"]
        }
      }`)

      const result = await environment.eslintPresets();

      expect(result).toEqual(['foo', 'bar']);
    });
  });

  describe('eslintPlugins', () => {
    it('should throw error when no supported eslint config is found', async () => {
      const result = environment.eslintPlugins();

      return expect(result).rejects.toEqual(expect.any(Error));
    });

    it('should return plugins from .eslintrc.json', async () => {
      fs._mockFileAccess('.eslintrc.json');
      fs._mockFileContents('.eslintrc.json', dedent`{
        "plugins": ["foo", "bar"]
      }`)

      const result = await environment.eslintPlugins();

      expect(result).toEqual(['foo', 'bar']);
    });

    it('should return presets from package.json', async () => {
      fs._mockFileAccess('package.json');
      fs._mockFileContents('package.json', dedent`{
        "eslintConfig": {
          "plugins": ["foo", "bar"]
        }
      }`)

      const result = await environment.eslintPlugins();

      expect(result).toEqual(['foo', 'bar']);
    });
  });

  describe('eslintRules', () => {
    it('should throw error when no supported eslint config is found', async () => {
      const result = environment.eslintRules();

      return expect(result).rejects.toEqual(expect.any(Error));
    });

    it('should return rules from .eslintrc.json', async () => {
      fs._mockFileAccess('.eslintrc.json');
      fs._mockFileContents('.eslintrc.json', dedent`{
        "rules": {
          "semi": ["warn", "always"]
        }
      }`)

      const result = await environment.eslintRules();

      expect(result).toEqual({
        semi: ['warn', 'always'],
      });
    });

    it('should return presets from package.json', async () => {
      fs._mockFileAccess('package.json');
      fs._mockFileContents('package.json', dedent`{
        "eslintConfig": {
          "rules": {
            "semi": ["warn", "always"]
          }
        }
      }`)

      const result = await environment.eslintRules();

      expect(result).toEqual({
        semi: ['warn', 'always'],
      });
    });
  });

});
