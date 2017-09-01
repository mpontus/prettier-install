import R from 'ramda';
import modifyEslintConfig from '../helpers/modifyEslintConfig';
import installModule from '../helpers/installModule';

const installEslintPlugin = async () => {
  await installModule('eslint-plugin-prettier');
  await modifyEslintConfig(
    R.compose(
      R.over(
        R.lensProp('plugins'),
        R.compose(
          R.uniq,
          R.append('prettier'),
          R.defaultTo([]),
        ),
      ),
      R.over(
        R.lensProp('rules'),
        R.compose(
          R.unless(
            R.has('prettier/prettier'),
            R.set(
              R.lensProp('prettier/prettier'),
              'warn',
            ),
          ),
          R.defaultTo({}),
        ),
      ),
    )
  )
}

export default installEslintPlugin;
