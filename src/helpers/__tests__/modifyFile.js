import fs from 'fs';
import modifyFile from '../modifyFile';

jest.mock('fs');

describe('modifyFile', () => {
  it('must change existing file using specified modifier', async () => {
    fs._mockFileContents('test.js', 'foo');

    const modifier = (contents) => {
      expect(contents).toBe('foo');

      return 'bar';
    }

    await modifyFile(modifier, 'test.js');

    expect(fs.writeFile).toHaveBeenCalledWith('test.js', 'bar', expect.any(Function));
  })
})
