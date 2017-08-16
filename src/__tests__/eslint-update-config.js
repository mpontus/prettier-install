const injectPrettierExtras = require('../eslint-update-config');

describe('injectPrettierExtras', () => {
  it('should add prettier plugin, preset, and rule', () => {
    expect(injectPrettierExtras({})).toEqual({
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    });
  });

  it('should add prettier to existing preset', () => {
    expect(injectPrettierExtras({
      extends: 'foo',
    })).toEqual({
      extends: ['foo', 'prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    });

    expect(injectPrettierExtras({
      extends: ['foo'],
    })).toEqual({
      extends: ['foo', 'prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    });
  })

  it('should move prettier preset to the last position', () => {
    expect(injectPrettierExtras({
      extends: ['prettier', 'foo'],
    })).toEqual({
      extends: ['foo', 'prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    });
  });

  it('should add prettier plugin to existing plugins', () => {
    expect(injectPrettierExtras({
      plugins: ['foo'],
    })).toEqual({
      extends: ['prettier'],
      plugins: ['foo', 'prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    });
  });

  it('should not alter plugins section when prettier is already present', () => {
    expect(injectPrettierExtras({
      plugins: ['prettier', 'foo'],
    })).toEqual({
      extends: ['prettier'],
      plugins: ['prettier', 'foo'],
      rules: {
        'prettier/prettier': 'error',
      },
    });
  });

  it('should add prettier rule to existing rules', () => {
    expect(injectPrettierExtras({
      rules: {
        'foo': 'error',
      },
    })).toEqual({
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'foo': 'error',
        'prettier/prettier': 'error',
      },
    });
  })

  it('should not change the custom setting for prettier rule', () => {
    expect(injectPrettierExtras({
      rules: {
        'prettier/prettier': 'warning',
      },
    })).toEqual({
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'warning',
      },
    });
  })

})
