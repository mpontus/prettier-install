import childProcess from 'child_process';
import installPrettier from '../installPrettier';

jest.mock('child_process');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

function noop () {};

const environment = {
  getPackager: jest.fn(() => Promise.resolve('npm')),
  getDependencies: jest.fn(() => Promise.resolve([])),
  directoryExists: jest.fn(() => Promise.resolve(false)),
};

const options = {};

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

  environment.getPackager.mockReturnValue(Promise.resolve('npm'));
  environment.getDependencies.mockReturnValue(Promise.resolve([]));
  environment.directoryExists.mockReturnValue(Promise.resolve(false));
})

test('displays progress', async () => {
  const stop = jest.fn();

  feedback.progress.mockReturnValueOnce(stop);

  const result = await installPrettier({ environment, options, feedback });

  expect(feedback.progress).toHaveBeenCalledWith('Installing prettier')
  expect(stop).toHaveBeenCalled();
})

test('installs prettier using npm', async () => {
  environment.getPackager.mockReturnValueOnce(Promise.resolve('npm'));

  await installPrettier({ environment, options, feedback });

  expect(childProcess.exec)
    .toHaveBeenCalledWith('npm install --save-dev prettier', {}, expect.any(Function));
});

test('installs prettier using yarn', async () => {
  environment.getPackager.mockReturnValueOnce(Promise.resolve('yarn'));

  await installPrettier({ environment, options, feedback });

  expect(childProcess.exec)
    .toHaveBeenCalledWith('yarn add --dev prettier', {}, expect.any(Function));
});

test('displays success message', async () => {
  await installPrettier({ environment, options, feedback });

  expect(feedback.success).toHaveBeenCalledWith('Prettier installed!');
})

test('skips installation when prettier is already installed', async () => {
  environment.getDependencies.mockReturnValueOnce(Promise.resolve(['prettier']));
  environment.directoryExists.mockImplementationOnce((path) => {
    expect(path).toBe('node_modules/prettier');

    return Promise.resolve(true);
  });

  await installPrettier({ environment, options, feedback });

  expect(childProcess.exec).not.toHaveBeenCalled();
});


