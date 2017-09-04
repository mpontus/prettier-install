import R from 'ramda';

export const skipWhen = predicate => fn => (context) =>
  Promise.resolve(predicate(context))
    .then(result => result ? undefined : fn(context));

export const withProgress = message => fn => async (context) => {
  const { feedback } = context;
  const stop = feedback.progress(message);

  try {
    return await fn(context);
  } finally {
    stop();
  }
}

export const isModuleInstalled = module => ({ environment }) =>
  environment.getInstalledModules()
    .then(modules => modules.includes(module));

export const hasOption = option => ({ options }) => options[option];
