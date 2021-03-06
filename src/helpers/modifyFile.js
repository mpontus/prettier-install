import { promisify } from 'util';
import fs from 'fs';
import R from 'ramda';

export const writeFile = R.curryN(2, promisify(fs.writeFile));

export const readFile = R.partialRight(promisify(fs.readFile), ['utf8']);

const modifyFile = R.curry(
  (modifier, filename) => R.composeP(
    writeFile(filename),
    modifier,
    readFile,
  )(filename),
);

export default modifyFile;
