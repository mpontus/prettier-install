import R from 'ramda';
import detectIndent from 'detect-indent';

const processJson = modifier => R.compose(
  ([indent, json]) => JSON.stringify(json, null, indent),
  R.juxt([
    R.compose(R.prop('indent'), detectIndent),
    R.compose(modifier, R.unary(JSON.parse)),
  ]),
);

export default processJson;
