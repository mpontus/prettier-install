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

    module({ feedback });

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

    await module({ feedback });

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

    await module({ feedback }).catch(noop);

    expect(stop).toHaveBeenCalled();
  });
});

describe('skipWhen', () => {
  it('must call the predicate with the context', async () => {
    const context = Symbol('context');
    const fn = () => {};
    const predicate = jest.fn(() => Promise.resolve(true));

    await skipWhen(predicate)(fn)(context);

    expect(predicate).toHaveBeenCalledTimes(1);
    expect(predicate).toHaveBeenCalledWith(context);
  })
  it('must allow the call when predicate resolves to true', async () => {
    const context = Symbol('context');
    const fn = jest.fn();
    const predicate = () => Promise.resolve(false);

    await skipWhen(predicate)(fn)(context);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(context);
  });

  it('must abort the call when predicate resolves to false', async () => {
    const fn = jest.fn();
    const predicate = () => Promise.resolve(true);

    await skipWhen(predicate)(fn)();

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('handles simple return values', async () => {
    const fn = jest.fn();
    const predicate = () => false;

    await skipWhen(predicate)(fn)();

    expect(fn).toHaveBeenCalled();
  });

  it('forwards the returned value', async () => {
    const expectedResult = Symbol('foo');
    const fn = () => expectedResult;
    const result = await skipWhen(() => false)(fn)();

    expect(result).toBe(expectedResult);
  });
})
