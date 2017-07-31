const tty = require('tty');

class Feedback {
  constructor(stdin, stdout) {
    this.stdin = stdin;
    this.stdout = stdout;
  }

  say(message) {
    this.stdout.write(`${message}\n`);
  }

  prompt(msg) {
    tty.setRawMode(true);
    this.stdout.write(`${msg} [yn]`);

    return new Promise((resolve, reject) => {
      this.stdin.on('data', (key) => {
        switch (key) {
          case 'y':
            resolve(true);

            break;

          case 'n':
            resolve(false);

            break;

          default: return;
        }

        tty.setRawMode(false);
        this.stdout.write('\n');
      });

      this.stdin.on('end', () => {
        tty.setRawMode(false);

        reject(new Error('STDIN closed'));
      });

    });
  }
}

module.exports = Feedback;
