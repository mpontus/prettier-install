const R = require('ramda');

const addPreset = R.over(
  R.lensProp('extends'),
  R.compose(
    R.append('prettier'),
    R.reject(
      R.equals('prettier'),
    ),
    R.unless(
      R.is(Array),
      R.of,
    ),
    R.defaultTo([]),
  )
);

const addPlugin = R.over(
  R.lensProp('plugins'),
  R.compose(
    R.unless(
      R.any(R.equals('prettier')),
      R.append('prettier'),
    ),
    R.unless(
      R.is(Array),
      R.of,
    ),
    R.defaultTo([]),
  )
)

const addRule = R.over(
  R.lensPath(['rules', 'prettier/prettier']),
  R.defaultTo('error'),
)

const injectPrettierExtras = R.compose(
  addPreset,
  addPlugin,
  addRule,
)

module.exports = injectPrettierExtras;
