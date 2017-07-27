class Options {
  constructor(argv) {
    this.argv = argv;
  }

  getGlobPatterns() {
    return this.argv.slice(2);
  }
}

module.exports = Options;
