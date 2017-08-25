import childProcess from 'child_process';
import installPrettier from '../installPrettier';

jest.mock('child_process');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

function noop () {};

const env = {
  getPackager: jest.fn(() => Promise.resolve('npm')),
  getDependencies: jest.fn(() => Promise.resolve([])),
  directoryExists: jest.fn(() => Promise.resolve(false)),
};

const opts = {};

const feedback = {
  progress: jest.fn(),
  success: jest.fn(),
};

beforeEach(() => {
  childProcess.exec.mockImplementationOnce(
    (command, options, callback) => callback(null, '', '')
  );

  childProcess.exec.mockClear();

  feedback.progress.mockClear();
  feedback.progress.mockReturnValue(noop);

  env.getPackager.mockReturnValue(Promise.resolve('npm'));
  env.getDependencies.mockReturnValue(Promise.resolve([]));
  env.directoryExists.mockReturnValue(Promise.resolve(false));
})

test('displays progress', async () => {
  const stop = jest.fn();

  feedback.progress.mockReturnValueOnce(stop);

  const result = await installPrettier(env, opts, feedback);

  expect(feedback.progress).toHaveBeenCalledWith('Installing prettier')
  expect(stop).toHaveBeenCalled();
})

test('installs prettier using npm', async () => {
  env.getPackager.mockReturnValueOnce(Promise.resolve('npm'));

  await installPrettier(env, opts, feedback);

  expect(childProcess.exec)
    .toHaveBeenCalledWith('npm install --save-dev prettier', {}, expect.any(Function));
});

test('installs prettier using yarn', async () => {
  env.getPackager.mockReturnValueOnce(Promise.resolve('yarn'));

  await installPrettier(env, opts, feedback);

  expect(childProcess.exec)
    .toHaveBeenCalledWith('yarn add --dev prettier', {}, expect.any(Function));
});

test('displays success message', async () => {
  await installPrettier(env, opts, feedback);

  expect(feedback.success).toHaveBeenCalledWith('Prettier installed!');
})

test('skips installation when prettier is already installed', async () => {
  env.getDependencies.mockReturnValueOnce(Promise.resolve(['prettier']));
  env.directoryExists.mockImplementationOnce((path) => {
    expect(path).toBe('node_modules/prettier');

    return Promise.resolve(true);
  });

  await installPrettier(env, opts, feedback);

  expect(childProcess.exec).not.toHaveBeenCalled();
});


