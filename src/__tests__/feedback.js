const stream = require('stream');
const Feedback = require('../feedback');

function noop() {};

function mockStdout() {
  const stdout = new stream.Writable();

  stdout.write = jest.fn();

  return stdout;
}

function mockStdin() {
  const stdin = new stream.Readable();

  stdin._read = noop;
  stdin.setRawMode = jest.fn();

  return stdin;
}

describe('Feedback', () => {
  describe('say', () => {
    it('should print the message', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);

      feedback.say('foobar');

      expect(stdout.write).toHaveBeenCalledWith('foobar\n');
    });
  });

  describe('prompt', () => {
    it('should print the question', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);

      stdout.write = jest.fn();

      feedback.prompt('Foo?');

      expect(stdout.write).toHaveBeenCalledWith(
        'Foo? [yn]',
      );
    })

    it('should return a promise', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      expect(result).toBeInstanceOf(Promise);
    });

    it('should set tty to raw mode during prompt', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);

      feedback.prompt('Foo?');

      expect(stdin.setRawMode).toHaveBeenCalledWith(true);
    });

    it('should resolve to true after accepting the positive answer', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      stdin.emit('data', 'y');

      return expect(result).resolves.toBe(true);
    });

    it('should resolve to false afeter accepting the negative answer', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      stdin.emit('data', 'n');

      return expect(result).resolves.toBe(false);
    });

    it('should print newline after accepting an answer', async () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      stdout.write.mockClear();

      stdin.emit('data', 'n');

      await result;

      expect(stdout.write).toHaveBeenCalledWith('\n');
    })

    it('should reset tty mode after reciving the answer', async () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      stdin.setRawMode.mockClear();

      stdin.emit('data', 'n');

      await result;

      expect(stdin.setRawMode).toHaveBeenCalledWith(false);
    })

    it('should reject if stream closes before providing the answer', () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      stdin.emit('end');

      return expect(result).rejects.toMatchObject({
        message: 'STDIN closed',
      })
    });

    it('should reset tty mode after encountering an error', async () => {
      const stdin = mockStdin();
      const stdout = mockStdout()
      const feedback = new Feedback(stdin, stdout);
      const result = feedback.prompt('Foo?');

      stdin.setRawMode.mockClear();

      stdin.emit('end');

      await result.catch(noop);

      expect(stdin.setRawMode).toHaveBeenCalledWith(false);
    })
  })
})
