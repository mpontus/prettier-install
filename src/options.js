const minimist = require('minimist');
const { pickBy, negate, isUndefined } = require('lodash/fp');

const isDefined = negate(isUndefined);
const pickDefined = pickBy(isDefined);

const parserOptions = {
  alias: {
    'print-width': 'printWidth',
    'tab-width': 'tabWidth',
    'trailing-comma': 'trailingComma',
    'use-tabs': 'useTabs',
    'single-quote': 'singleQuote',
    'bracket-spacing': 'bracketSpacing',
    'jsx-bracket-same-line': 'jsxBracketSameLine',
  },
  default: {
    semi: true,
    'bracket-spacing': true,
  }
};

class Options {
  constructor(argv) {
    this.argv = argv;
  }

  /**
   * Returns glob patterns passed as trailing arguments to prettier-install
   */
  getGlobPatterns() {
    return minimist(this.argv)._.slice(2);
  }

  /**
   * Returns an object of options recognized by prettier from own arguments.
   */
  getPrettierOptions() {
    const parsedArguments = minimist(this.argv, parserOptions);
    const {
      printWidth,
      tabWidth,
      useTabs,
      semi,
      singleQuote,
      trailingComma,
      bracketSpacing,
      jsxBracketSameLine,
    } = parsedArguments;

    const prettierOptions = {
      printWidth,
      tabWidth,
      useTabs,
      semi: semi === true ? undefined : false,
      singleQuote,
      trailingComma,
      bracketSpacing: bracketSpacing === true ? undefined : false,
      jsxBracketSameLine,
    };

    const explicitOptions = pickDefined(prettierOptions);

    return explicitOptions;
  }

  /**
   * Returns a string containing arguments to be passed to prettier executable.
   */
  getPrettierArguments() {
    const explicitOptions = this.getPrettierOptions();

    const {
      printWidth,
      tabWidth,
      useTabs,
      semi,
      singleQuote,
      trailingComma,
      bracketSpacing,
      jsxBracketSameLine,
    } = explicitOptions;

    const args = [
      printWidth && `--print-width ${printWidth}`,
      tabWidth && `--tab-width ${tabWidth}`,
      useTabs && '--use-tabs',,
      semi === false && '--no-semi',
      singleQuote && '--single-quote',
      trailingComma && `--trailing-comma ${trailingComma}`,
      bracketSpacing === false && '--no-bracket-spacing',
      jsxBracketSameLine && '--jsx-bracket-same-line',
    ]
      .filter(Boolean)
      .join(' ');

    return args;
  }
}

module.exports = Options;
