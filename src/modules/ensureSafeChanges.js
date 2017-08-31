import { promisify } from 'util';
import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import R from 'ramda';
import { skipWhen } from '../helpers/modules';

const isFileExecutable = path =>
  promisify(fs.access)(path, fs.constants.X_OK)
    .then(() => true, () => false);

const findExecutable = async (filename) => {
  const execPaths = process.env.PATH.split(path.delimiter);

  for (let execPath of execPaths) {
    const candidate = path.join(execPath, filename);

    if (await isFileExecutable(candidate)) {
      return candidate;
    }
  }

  return null;
}

const isGitAvailable = () => findExecutable('git');

const shouldSkip = R.composeP(R.not, isGitAvailable);

export const enhance = skipWhen(shouldSkip);

const isWorkingTreeClean = () =>
  promisify(childProcess.exec)('git diff-index --quiet HEAD --')
    .then(() => true, () => false);

export async function ensureSafeChanges({ feedback }) {
  if (await isWorkingTreeClean()) {
    return;
  }

  if (await feedback.prompt('Working tree is not clean. Proceed anyway?')) {
    return;
  }

  process.exit(1);
}
