const { Command } = require('commander');
const { pickBy, negate, isUndefined } = require('lodash/fp');

const isDefined = negate(isUndefined);
const pickDefined = pickBy(isDefined);

class Options {
  constructor(argv) {
    this.program = new Command();
    this.program
      .version('0.0.1')
      .option('--print-width [int]', 'Maximum line length', parseInt)
      .option('--tab-width [int]', 'Indentation width', parseInt)
      .option('--use-tabs', 'Use tabs for indentation')
      .option('--no-semi', 'Omit semicolons')
      .option('--single-quote', 'Use single quotes for strings')
      .option('--trailing-comma [syntax]', 'Print trailing commas (none, es5, all)')
      .option('--no-bracket-spacing',
        'Omit spaces between brackets in object literals')
      .option('--jsx-bracket-same-line',
        'Puts closing > on the end of the last line')
      .parse(argv);
  }

  getGlobPatterns() {
    return this.program.args;
  }

  getPrettierOptions() {
    const {
      printWidth,
      tabWidth,
      useTabs,
      semi,
      singleQuote,
      trailingComma,
      bracketSpacing,
      jsxBracketSameLine,
    } = this.program;

    const options = {
      printWidth,
      tabWidth,
      useTabs,
      semi: semi === true ? undefined : false,
      singleQuote,
      trailingComma,
      bracketSpacing: bracketSpacing === true ? undefined : false,
      jsxBracketSameLine,
    };

    const explicitOptions = pickDefined(options);

    if (Object.keys(explicitOptions).length === 0) {
      return null;
    }

    return explicitOptions;
  }
}

module.exports = Options;
