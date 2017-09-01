import R from 'ramda';
import findEslintConfig from './findEslintConfig';
import modifyFile from './modifyFile';
import processJson from './processJson';

const applyModifierToFile = R.curry(
  (filename, modifier) => {
    switch (filename) {
      case '.eslintrc.json':
        return modifier;
      case 'package.json':
        return R.over(R.lensProp('eslintConfig'), modifier);
      default:
        return null;
    }
  }
)

const modifyEslintConfig = async (modifier) => {
  const filename = await findEslintConfig();

  if (!filename) {
    throw new Error('Eslint configuration file is not found');
  }

  const fileModifier = applyModifierToFile(filename, modifier);

  if (!fileModifier) {
    throw new Error(`Eslint configuration in file ${filename} is not supported`);
  }

  return modifyFile(processJson(fileModifier), filename);
}

export default modifyEslintConfig;
