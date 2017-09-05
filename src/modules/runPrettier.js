import { promisify } from 'util';
import childProcess from 'child_process';
import R from 'ramda';
import { skipWhen, withProgress, hasOption, isModuleInstalled } from "../helpers/modules";

const shouldSkip = ({ options, environment }) => {
  if (options['no-run']) {
    return true;
  }

  return environment.getInstalledModules()
    .then(modules => !modules.includes('prettier'));
}

export const enhancer = R.compose(
  skipWhen(shouldSkip),
  withProgress('Running prettier'),
)

export const runPrettier = () =>
  promisify(childProcess.exec)('./node_modules/.bin/prettier --write **/*.js');

export default enhancer(runPrettier);
