const R = require('ramda');
const recast = require('recast');
const dedent = require('dedent');
const {
  arrayContainsString,
  propNameEquals,
  removeStringFromArray,
  ensureStringInArray,
  ensureStringAtTheEndOfArray,
  ensurePropExists,
  updateProp,
  addOrUpdateProp,
  addPlugin,
  addPreset,
  updateAst,
  updateEslintrcContents,
  createKey,
} = require('../ast-eslintrc');
const b = recast.types.builders;

const parseExpression = code => recast.parse(code).program.body[0].expression;
const printExpression = code => recast.print(code).code;


const passThrough = (fn, code) =>
  recast.print(fn(recast.parse(code))).code;

describe('updateAst', () => {
  it('must add new sections for prettier extras when they do not exist', () => {
    const code = dedent`
      module.exports = {};
    `

    const result = updateEslintrcContents(code);

    expect(result).toEqual(dedent`
      module.exports = {
        extends: ["prettier"],
        plugins: ["prettier"],\n
        rules: {
          "prettier/prettier": "error"
        }
      };
    `)
  });

  it('should add prettier extras into existing sections', () => {
    const code = dedent`
      module.exports = {
        extends: ["foo"],
        plugins: ["bar"],
        rules: {
          baz: "error",
        },
      };
    `

    const result = updateEslintrcContents(code);

    expect(result).toEqual(dedent`
      module.exports = {
        extends: ["foo", "prettier"],
        plugins: ["bar", "prettier"],\n
        rules: {
          baz: "error",
          "prettier/prettier": "error"
        }
      };
    `)
  });

  it('should replace invalid sections', () => {
    const code = dedent`
      module.exports = {
        extends: "foo",
        plugins: "bar",
        rules: "baz",
      };
    `;

    const result = updateEslintrcContents(code);

    expect(result).toEqual(dedent`
      module.exports = {
        extends: ["foo", "prettier"],
        plugins: ["prettier"],\n
        rules: {
          "prettier/prettier": "error"
        }
      };
    `)
  });

  it('should move prettier preset to the end', () => {
    const code = dedent`
      module.exports = {
        extends: ["prettier", "foo"],
        plugins: ["prettier", "bar"],
        rules: {
          "prettier/prettier": "error",
          baz: "error",
        }
      };
    `;

    const result = updateEslintrcContents(code);

    expect(result).toEqual(dedent`
      module.exports = {
        extends: ["foo", "prettier"],
        plugins: ["prettier", "bar"],\n
        rules: {
          "prettier/prettier": "error",
          baz: "error"
        }
      };
    `)
  });
})

describe('arrayContainsString', () => {
  it('must return true when array contains specified string', () => {
    const code = '[ \'foo\',, "bar"]'
    const ast = parseExpression(code);

    expect(arrayContainsString('foo', ast)).toBe(true);
    expect(arrayContainsString('bar', ast)).toBe(true);
  });

  it('must return false when array does not contain specified string', () => {
    const code = '["foo", "bar"]'
    const ast = parseExpression(code);
    const result = arrayContainsString('baz', ast);

    expect(result).toBe(false);
  });
});

describe('removeStringFromArray', () => {
  it('must remove all occurences of specified string from array', () => {
    const code = '["foo", "bar", "foo", "baz"]';
    const ast = parseExpression(code);
    const result = removeStringFromArray('foo', ast);

    expect(printExpression(result)).toBe('["bar", "baz"]');
  })
})

describe('ensureStringInArray', () => {
  it('must add string to array when it does not exist', () => {
    const code = '["foo", "bar"]';
    const ast = parseExpression(code);
    const result = ensureStringInArray('baz', ast);

    expect(printExpression(result)).toEqual(
      '["foo", "bar", "baz"]',
    );
  });

  it('must not change expression which includes specified string', () => {
    const code = '["foo", "bar"]';

    const ast = parseExpression(code);
    const result = ensureStringInArray('foo', ast);

    expect(printExpression(result)).toEqual(
      '["foo", "bar"]',
    );
  })
});

describe('ensureStringAtTheEndOfArray', () => {
  it('must add string to the end of the array', () => {
    const code = '["foo", "bar"]';
    const ast = parseExpression(code);
    const result = ensureStringAtTheEndOfArray('baz', ast);

    expect(printExpression(result)).toEqual(
      '["foo", "bar", "baz"]',
    );
  });

  it('must move existing string to the end of the array', () => {
    const code = '["foo", "bar"]';
    const ast = parseExpression(code);
    const result = ensureStringAtTheEndOfArray('foo', ast);

    expect(printExpression(result)).toEqual(
      '["bar", "foo"]',
    );
  });
});

describe('ensurePropExists', () => {
  it('must set default prop on object literal when prop does not exist', () => {
    const code = dedent`
      ({
        foo: "bar"
      });
    `;
    const ast = recast.parse(code);
    const result = R.over(
      R.lensPath(['program', 'body', 0, 'expression']),
      ensurePropExists('bar', b.stringLiteral('baz'))
    )(ast);

    expect(printExpression(result)).toEqual(
      dedent`
        ({
          foo: "bar",
          bar: "baz"
        });
      `
    );
  });

  it('must leave object literal unchanged when it contains specified prop', () => {
    const code = dedent`
      ({
        foo: "bar"
      });
    `;
    const ast = recast.parse(code);
    const result = R.over(
      R.lensPath(['program', 'body', 0, 'expression']),
      ensurePropExists('foo', b.stringLiteral('baz'))
    )(ast);

    expect(printExpression(result)).toEqual(
      dedent`
        ({
          foo: "bar"
        });
      `
    );
  })
});

describe('updateProp', () => {
  it('must update prop on object literal using callback', () => {
    expect.assertions(2);
    const code = dedent`
      ({
        foo: "bar"
      });
    `;
    const ast = recast.parse(code);
    const callback = node => {
      expect(node.value).toBe('bar');

      return b.stringLiteral('baz');
    };
    const result = R.over(
      R.lensPath(['program', 'body', 0, 'expression']),
      updateProp('foo', callback),
    )(ast);

    expect(printExpression(result)).toEqual(
      dedent`
        ({
          foo: "baz"
        });
      `
    );
  })
});
