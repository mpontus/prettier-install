class Feedback {
  constructor(stdin, stdout) {
    this.stdin = stdin;
    this.stdout = stdout;
  }

  say(message) {
    this.stdout.write(`${message}\n`);
  }

  prompt(msg) {
    this.stdout.write(`${msg} [yn]`);
    this.stdin.setRawMode(true);

    return new Promise((resolve, reject) => {
      this.stdin.on('data', (key) => {
        switch (key.toString()) {
          case 'y':
            resolve(true);

            break;

          case 'n':
            resolve(false);

            break;

          default: return;
        }

        this.stdout.write('\n');
        this.stdin.setRawMode(false);
      });

      this.stdin.on('end', () => {
        this.stdin.setRawMode(false);

        reject(new Error('STDIN closed'));
      });

    });
  }
}

module.exports = Feedback;
