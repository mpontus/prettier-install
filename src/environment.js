// TODO: try fs-extra
import { promisify } from 'util';
import { readFile } from 'fs';

export default class Environment {
  async getProjectDependencies() {
    const projectMetadataContents = await promisify(readFile)('package.json', 'utf-8');
    const projectMetadata = JSON.parse(projectMetadataContents);
    const { dependencies, devDependencies } = projectMetadata;

    return {
      ...dependencies,
      ...devDependencies,
    };
  }

  getInstalledModules() {

  }

  getPackageScripts() {

  }

  pathExists() {

  }

  findExecutable() {

  }

  isCleanWorkingTree() {

  }

  findEslintrc() {

  }

  eslintPresets() {

  }

  eslintPlugins() {

  }

  eslintRules() {

  }
}
