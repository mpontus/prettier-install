import { promisify } from 'util';
import fs from 'fs';
import R from 'ramda';
import detectIndent from 'detect-indent';
import { skipWhen, withProgress } from '../helpers/modules';

const DEFAULT_GLOB = '**/*.js';

/*
 * Module decorator
 *
 * This part controls the module invocation in the context of the program.
 */

const hasOption = option => ({ options }) => R.has(option, options);

const eslintInstalled = ({ environment }) => 'eslint' in environment.getProjectDependencies();

// Forego skip checks when user demands script to be installed
const shouldForce = hasOption('command');

const shouldSkip = R.anyPass([
  // Skip if prettier script already exists
  ({ environment }) => 'prettier' in environment.getPackageScripts(),
  // Skip if user does not want script to be added (--no-command)
  hasOption('no-command'),
  // Skip when eslint can be used to fix files instead
  R.allPass([
    // Eslint is installed and eslint-plugin will soon be installed
    eslintInstalled,
    // Unless the user refuses it explicitly
    R.complement(hasOption('no-eslint-plugin')),
  ]),
  // Skip when user expects eslint plugin to be installed
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

/*
 * Module Core
 *
 * This part describes the primary function of the module
 */

// Read file, modify contents using specified function, then write modified contents back
const modifyFile = (filename, modifier) => R.composeP(
  contents => promisify(fs.writeFile)(filename, contents),
  modifier,
  filename => promisify(fs.readFile)(filename, 'utf8'),
)(filename);

// Alter JSON string while preserving indentation
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
