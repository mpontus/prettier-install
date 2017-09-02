import R from 'ramda';
import detectIndent from 'detect-indent';

export const stringifyJson = R.curry(
  (indent, json) => JSON.stringify(json, null, indent),
)

const processJson = modifier => R.compose(
  R.apply(stringifyJson),
  R.juxt([
    R.compose(R.prop('indent'), detectIndent),
    R.compose(modifier, R.unary(JSON.parse)),
  ]),
);

export default processJson;
