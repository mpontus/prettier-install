import { promisify } from 'util';
import childProcess from 'child_process';

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
