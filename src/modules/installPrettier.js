import { exec } from 'child_process';
import R from 'ramda';
import { promisify } from 'util';
import { skipWhen, withProgress } from '../helpers/modules';
import { packagerInstallCommand } from '../helpers/packagers';

const shouldSkip = async (env) => {
  const dependencies = await env.getDependencies();

  return (
    dependencies.includes('prettier') &&
    await env.directoryExists('node_modules/prettier')
  );
}

const enhance = R.compose(
  skipWhen(shouldSkip),
  withProgress('Installing prettier'),
);

const installPrettier = async (env, opts, feedback) => {
  const packager = await env.getPackager();

  if (!packager) {
    throw new Error('No packager is available.');
  }

  const command = packagerInstallCommand(packager, ['prettier']);

  await promisify(exec)(command, {});

  feedback.success('Prettier installed!');
}

export default enhance(installPrettier);
