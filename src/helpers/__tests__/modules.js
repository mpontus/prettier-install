import { withProgress, skipWhen } from '../modules';

function noop () {};

describe('withProgress', () => {
  it('must show progress initially', () => {
    const module = withProgress('foo')(
      () => new Promise(noop)
    );
    const feedback = {
      progress: jest.fn(),
    };

    module({}, {}, feedback);

    expect(feedback.progress).toHaveBeenCalledWith('foo');
  });

  it('must stop progress when promise resolves', async () => {
    const stop = jest.fn();
    const feedback = {
      progress: () => stop,
    };
    const module = withProgress('foo')(
      () => Promise.resolve(),
    );

    await module({}, {}, feedback);

    expect(stop).toHaveBeenCalled();
  })

  it('must stop progress when promise rejects', async () => {
    const stop = jest.fn();
    const feedback = {
      progress: () => stop,
    };
    const module = withProgress('foo')(
      () => Promise.reject(new Error('bar')),
    );

    await module({}, {}, feedback).catch(noop);

    expect(stop).toHaveBeenCalled();
  });
});

describe('skipWhen', () => {
  it('must call the inner function when predicate result resolves to false', async () => {
    const inner = jest.fn();
    const predicate = () => Promise.resolve(false);

    await skipWhen(predicate)(inner)();

    expect(inner).toHaveBeenCalled();
  });

  it('must not call the inner function when predicate result resolves to true', async () => {
    const inner = jest.fn();
    const predicate = () => Promise.resolve(true);

    await skipWhen(predicate)(inner)();

    expect(inner).not.toHaveBeenCalled();
  });

  it('handles simple return values', async () => {
    const inner = jest.fn();
    const predicate = () => false;

    await skipWhen(predicate)(inner)();

    expect(inner).toHaveBeenCalled();
  });

  it('returns the value returned by inner function', async () => {
    const innerResult = Symbol('foo');
    const outerResult = await skipWhen(() => false)(() => innerResult)();

    expect(outerResult).toBe(innerResult);
  });
})
