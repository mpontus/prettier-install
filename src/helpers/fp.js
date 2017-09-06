import R from "ramda";

// Like Ramda's allPass but for promises
export const allPassP = R.curry(async (predicates, arg) => {
  for (let predicate of predicates) {
    if (!await predicate(arg)) {
      return false;
    }
  }
  return true;
});

// Like Ramda's anyPass but for promises
export const anyPassP = R.curry(async (predicates, arg) => {
  for (let predicate of predicates) {
    if (await predicate(arg)) {
      return true;
    }
  }
  return false;
});
