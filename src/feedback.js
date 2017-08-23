const readline = require('readline');
const R = require('ramda');
const chalk = require('chalk');
const { Spinner } = require('cli-spinner');

class Feedback {
  constructor(stdin, stdout) {
    this.stdin = stdin;
    this.stdout = stdout;
  }

  progress(message) {
    const spinner = new Spinner({
      text: `[${chalk.yellow('%s')}] ${message}`,
      stream: this.stdout,
    });

    spinner.setSpinnerString(Spinner.spinners[18]);
    spinner.start();

    return () => spinner.stop(true);
  }

  prompt(message, defaultOnReturn = '') {
    const icon = `[${chalk.yellow('?')}]`;

    const options = ['y', 'n']
      .map(char => char === defaultOnReturn ? char.toUpperCase() : char)
      .join('/');

    const question = `${icon} ${message} (${options}) `;

    const printQuestion = () => {
      this.stdout.write(question);
    }

    printQuestion();

    return new Promise((resolve) => {
      const keyCodeEquals = code => keyPress => keyPress[0] === code;

      const echoKeypress = R.tap(
        R.ifElse(
          keyCodeEquals(13),
          () => this.stdout.write('\n'),
          keyPress => this.stdout.write(`${keyPress}\n`),
        ),
      );

      const handleInterrupt = R.ifElse(
        keyCodeEquals(3),
        () => {
          process.stdout.write('\n');
          process.exit(1);
        },
      );

      const handleReturn = R.when(
        keyCodeEquals(13),
        R.always(defaultOnReturn),
      );

      const processAnswer = (key) => {
        switch (key.toString().toLowerCase()) {
          case 'y': return true;
          case 'n': return false;
          default: return null;
        }
      }

      const acceptAnswer = callback => answer => {
        this.stdin
          .removeListener('data', callback)
          .pause()
          .setRawMode(false);

        resolve(answer);
      }

      const rejectAnswer = () => printQuestion();

      const callback = (key) => handleInterrupt(
        R.pipe(
          echoKeypress,
          handleReturn,
          processAnswer,
          R.ifElse(
            R.isNil,
            rejectAnswer,
            acceptAnswer(callback),
          )
        )
      )(key);

      this.stdin
        .resume()
        .on('data', callback)
        .setRawMode(true);
    });
  }

  success(message) {
    const icon = `[${chalk.green('*')}]`;

    readline.clearLine(this.stdout, 0);
    readline.cursorTo(this.stdout, 0);
    this.stdout.write(`${icon} ${message}\n`);
  }

  info(message) {
    const icon = `[${chalk.yellow('%')}]`;

    readline.clearLine(this.stdout, 0);
    readline.cursorTo(this.stdout, 0);
    this.stdout.write(`${icon} ${message}\n`);
  }

  failure(message) {
    const icon = `[${chalk.red('!')}]`;

    readline.clearLine(this.stdout, 0);
    readline.cursorTo(this.stdout, 0);
    this.stdout.write(`${icon} ${message}\n`);
  }
}

module.exports = Feedback;
