import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import childProcess from 'child_process';
import R from 'ramda';

const isExecutable = path =>
  promisify(fs.access)(path, fs.constants.X_OK)
    .then(() => true, () => false);

const detectPackager = async () => {
  const execPaths = process.env.PATH.split(':');

  for (let packager of ['yarn', 'npm']) {
    for (let execPath of execPaths) {
      const candidatePath = path.join(execPath, packager);

      if (await isExecutable(candidatePath)) {
        return packager;
      }
    }
  }

  return null;
}

const installModulesCommand = async (modules) => {
  const packager = await detectPackager();

  if (!packager) {
    throw new Error('No packager is available');
  }

  switch (packager) {
    case 'npm':
      return `npm install --save-dev ${modules.join(' ')}`
    case 'yarn':
      return `yarn add --dev ${modules.join(' ')}`
    case null:
      throw new Error('No packager is available');
    default:
      throw new Error(`Unknown packager: ${packager}`);
  }
}

const installModules = R.composeP(
  promisify(childProcess.exec),
  installModulesCommand,
);

export default installModules;
