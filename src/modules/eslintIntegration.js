import R from 'ramda';
import installModules from '../helpers/installModules';
import modifyEslintConfig from '../helpers/modifyEslintConfig';

const ensureLastPreset = name => R.over(
  R.lensProp('extends'),
  R.pipe(
    // TODO: refactor to defaultTo
    R.cond([
      [R.isNil, R.always([])],
      [R.is(Array), R.identity],
      [R.T, R.of],
    ]),
    R.without([name]),
    R.append(name),
  ),
);

const addPlugin = name => R.over(
  R.lensProp('plugins'),
  R.pipe(
    R.append(name),
    R.uniq,
  )
);

const addRule = (name, value) => R.over(
  R.lensProp('rules'),
  R.pipe(
    R.defaultTo({}),
    R.unless(
      R.has(name),
      R.set(
        R.lensProp(name),
        value,
      ),
    ),
  )
);

const eslintIntegration = async ({ environment }) => {
  const dependencies = await environment.getProjectDependencies();
  const toInstall = R.difference(
    ['eslint-config-prettier', 'eslint-plugin-prettier'],
    R.keys(dependencies),
  );

  if (toInstall.length > 0) {
    await installModules(toInstall);
  }

  await modifyEslintConfig(R.pipe(
    ensureLastPreset('prettier'),
    addPlugin('prettier'),
    addRule('prettier/prettier', 'warn'),
  ));
};

export default eslintIntegration;
