const fs = jest.genMockFromModule('fs');

const _enoentError = () => {
  const error = new Error('No such file or directory');

  error.code = 'ENOENT';

  return error;
}

const _eaccesError = () => {
  const error = new Error('Permission denied');

  error.code = 'EACCES';

  return error;
}

const allModes =
  fs.constants.F_OK &
  fs.constants.R_OK &
  fs.constants.W_OK &
  fs.constants.X_OK;

const _fileStats = { isFile: () => true };
const _dirStats = { isDirectory: () => true }

let _filesAccess = {};
let _filesStats = {};
let _filesContents = {};
let _dirsContents = {};

const _mockFileAccess = (path, mode = allModes) => {
  _filesAccess[path] = mode;
};
const _mockFileStats = (path, stats = _fileStats) => {
  _filesStats[path] = stats;
};
const _mockFileContents = (path, contents) => {
  _filesContents[path] = contents;
};
const _mockDirContents = (path, contents) => {
  _dirsContents[path] = contents;
};
const _mockReset = () => {
  _filesAccess = {};
  _filesStats = {};
  _filesContents = {};
  _dirsContents = {};
}

const access = jest.fn((path, mode, callback) => {
  if (!callback) {
    [callback, mode] = [mode, fs.constants.F_OK];
  };

  const fileAccess = _filesAccess[path];

  if (fileAccess === undefined) {
    callback(_enoentError());

    return;
  }

  if (mode && !(fileAccess & mode)) {
    callback(_eaccesError());

    return;
  }

  callback(null);
});

const stat = jest.fn((path, callback) => {
  const fileStats = _filesStats[path];

  if (fileStats === undefined) {
    callback(_enoentError());

    return;
  }

  callback(null, fileStats);
});

const readFile = jest.fn((path, options, callback) => {
  if (!callback) {
    [callback, options] = [options, null];
  }

  const fileContents = _filesContents[path];

  if (fileContents === undefined) {

    callback(_enoentError());
  }

  callback(null, options === 'utf8' ? fileContents : Buffer.from(fileContents));
});

const readDir = jest.fn((path, options, callback) => {
  if (!callback) {
    [callback, options] = [options, null];
  }

  const dirContents = _dirsContents[path];

  if (dirContents === undefined) {
    callback(_enoentError());
  }

  callback(null, dirContents);
});


module.exports = fs;

Object.assign(module.exports, {
  access,
  stat,
  readFile,
  readDir,
  _enoentError,
  _eaccesError,
  _mockFileAccess,
  _mockFileStats,
  _mockFileContents,
  _mockDirContents,
  _mockReset,
  _fileStats,
  _dirStats,
});
