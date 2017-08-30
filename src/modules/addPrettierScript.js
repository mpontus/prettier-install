import { promisify } from 'util';
import fs from 'fs';
import R from 'ramda';
import detectIndent from 'detect-indent';
import { skipWhen, withProgress } from '../helpers/modules';

const DEFAULT_GLOB = '**/*.js';

const hasOption = option => ({ options }) => R.has(option, options);

const eslintInstalled = ({ environment }) => 'eslint' in environment.getProjectDependencies();

const shouldForce = hasOption('command');

const shouldSkip = R.anyPass([
  ({ environment }) => 'prettier' in environment.getPackageScripts(),
  hasOption('no-command'),
  R.allPass([
    eslintInstalled,
    R.complement(hasOption('no-eslint-plugin')),
  ]),
  hasOption('eslint-plugin'),
]);

export const enhance = R.compose(
  skipWhen(
    R.ifElse(
      shouldForce,
      R.F,
      shouldSkip,
    ),
  ),
  withProgress('Adding prettier script'),
);

const readFile = filename => promisify(fs.readFile)(filename, 'utf8');

const writeFile = R.curry(R.binary(promisify(fs.writeFile)));

const modifyFile = (filename, modifier) => R.composeP(
  writeFile(filename),
  modifier,
  readFile,
)(filename);

const processJson = modifier => R.compose(
  ([indent, json]) => JSON.stringify(json, null, indent),
  R.juxt([
    R.compose(R.prop('indent'), detectIndent),
    R.compose(modifier, R.unary(JSON.parse)),
  ]),
);

export const addPrettierScript = ({ options }) => {
  const command = `prettier --write ${options.glob || DEFAULT_GLOB}`;

  return modifyFile(
    'package.json',
    processJson(R.set(
      R.lensPath(['scripts', 'prettier']),
      command,
    )),
  );
};

export default enhance(addPrettierScript);
