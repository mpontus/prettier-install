import R from 'ramda';

export const skipWhen = predicate => fn => (...args) =>
  Promise.resolve(predicate(...args))
    .then(result => result ? undefined : fn(...args));

export const withProgress = message => fn => async (env, opts, feedback) => {
  const stop = feedback.progress(message);

  try {
    return await fn(env, opts, feedback);
  } finally {
    stop();
  }
}
