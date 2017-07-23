function cmd(command) {
  let executable, args;

  if (Array.isArray(command)) {
    [executable, ...args] = command;
  } else {
    executable = '/bin/sh';
    args = ['-c', command];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: 'inherit' });

    child.on('exit', (code, signal) => {
      if (code !== 0) {
        const error = new Error();

        Object.assign(error, { code, signal });

        return reject(error);
      }

      resolve();
    });
  });
};

module.exports = {
  cmd,
};
