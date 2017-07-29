const Options = require('../options');

describe('Options', () => {
  describe('getPrettierArguments', () => {
    it('should include known arguments', () => {
      const options = new Options(['--print-width', '120', '--no-semi']);

      expect(options.getPrettierArguments()).toEqual(
        '--print-width 120 --no-semi',
      );
    });

    it('should not include unknown arguments', () => {
      const options = new Options(['--tab-width', '8', '--foo', 'bar']);

      expect(options.getPrettierArguments()).toEqual(
        '--tab-width 8',
      );
    })
  })
})
