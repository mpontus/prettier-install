const R = require('ramda');
const recast = require('recast');
const {
  namedTypes: n,
  builders: b,
} = recast.types;

/**
 * Returns whether array expression contains specific string literal
 *
 * @param {string} string String Literal
 * @param {ArrayExpression} array Array Expression
 * @returns {bool} Whether array expression contains string literal
 */
const arrayContainsString = R.uncurryN(
  2,
  string =>
    R.pipe(
      R.prop('elements'),
      R.any(
        R.both(
          n.Literal.check,
          R.pipe(
            R.prop('value'),
            R.equals(string),
          ),
        )
      ),
    ),
);

/**
 * Retruns array expression with specified string literal removed
 *
 * @param {string} string Removed string
 * @param {ArrayExpression} array Original array expression
 * @returns {ArrayExpression} Updated array expression
 */
const removeStringFromArray = R.uncurryN(
  2,
  string => R.over(
    R.lensProp('elements'),
    R.reject(
      R.both(
        n.Literal.check,
        R.pipe(
          R.prop('value'),
          R.equals(string),
        ),
      ),
    ),
  )
);

/**
 * Returns array expression with specified string added to the end
 *
 * @param {string} string Added string
 * @param {ArrayExpression} array Original array expression
 * @returns {ArrayExpression} Updated array expression
 */
const addStringToArray = R.uncurryN(
  2,
  string => R.over(
    R.lensProp('elements'),
    R.append(b.literal(string)),
  ),
)

/**
 * Ensure that the string in present in the array expression
 *
 * Add string literal to the end of array expression if its missing. otherwise
 * return the array expression unchagned.
 *
 * @param {string} string String to add if necessary
 * @param {ArrayExpression} array Original array expression
 * @returns {ArrayExpression} Updated array expression
 */
const ensureStringInArray = R.uncurryN(
  2,
  string => R.ifElse(
    arrayContainsString(string),
    R.identity,
    addStringToArray(string),
  ),
)

/**
 * Esnure that specified string is the last element in the array expression.
 *
 * Add string literal to the end of array expression if its missing. Otherwise
 * move matched string literal to the end of the array expression.
 *
 * @param {string} string String to add or move if necessary
 * @param {ArrayExpression} array Original array expression
 * @returns {ArrayExpression} Updated array expression
 */
const ensureStringAtTheEndOfArray = R.uncurryN(
  2,
  string => R.pipe(
    removeStringFromArray(string),
    addStringToArray(string),
  ),
)

/**
 * Returns true when string can be a valid identifier.
 *
 * @param {string} string Candidate string
 * @returns {bool} Result
 */
const isValidIdentifier = R.test(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/);

/**
 * Converts various argument to valid key for object literal
 *
 * @param {Identifier|Literal|string} key Candiate for a key
 * @returns {Identifier|Literal} Something that can be used as a key
 */
const createKey = R.cond([
  [n.Identifier.check, R.identity],
  [n.Literal.check, R.identity],
  [isValidIdentifier, b.identifier],
  [R.T, b.literal],
]);

/**
 * Returns true if the name of Property node matches specified string.
 *
 * @param {string} string String to compare against
 * @param {Property} node Property node
 * @returns {bool} Result
 */
const propNameEquals = name => R.compose(
  R.equals(name),
  R.cond([
    [n.Identifier.check, R.prop('name')],
    [n.Literal.check, R.prop('value')],
  ]),
  R.prop('key'),
)

/**
 * Ensure that prop by the specified node existis in the object expression node
 *
 * Add property with specified name to object expression if it doesn't exist.
 * Otherwise return the original object expression unchanged.
 *
 * @param {string} name Property name
 * @param {Node} Default value
 * @param {ObjectExpression} object Original object expression
 * @returns {ObjectExpression} Updated object expression
 */
const ensurePropExists = R.uncurryN(
  3,
  name => _default => R.over(
    R.lensProp('properties'),
    R.unless(
      R.any(propNameEquals(name)),
      R.append(
        b.property(
          'init',
          createKey(name),
          _default,
        )
      ),
    ),
  ),
)

/**
 * Update prop value in object expression using specified function.
 *
 * @param {string} name Property name
 * @param {func} fn Function that processes current value and returns new value
 * @param {ObjectExpression} objectOriginal object expression
 * @returns {ObjectExpression} Updated object expression
 */
const updateProp = R.uncurryN(
  3,
  name => fn => R.over(
    R.lensProp('properties'),
    R.map(
      R.when(
        propNameEquals(name),
        R.over(
          R.lensProp('value'),
          fn,
        ),
      ),
    ),
  ) ,
)

/**
 * Update object expression property using specified function.
 *
 * Sets the preoperty to default value if it doesn't exist before the update.
 *
 * @param {string} name Property name
 * @param {Node} default Node to set the property to if it doesn't exist
 * @param {func} fn Updater function
 * @param {ObjectExpression} object Original object expression
 * @param {ObjectExpression} Updated object expression
 */
const addOrUpdateProp = R.uncurryN(
  4,
  name => _default => fn => R.pipe(
    ensurePropExists(name, _default),
    updateProp(name, fn),
  ),
)

/**
 * Ensure that specified plugin is included in eslintrc configuration
 *
 * @param {string} name Plugin name
 * @param {ObjectExpression} object Eslint configuration as object expression
 * @returns {ObjectExpression} Updated object expression
 */
const addPlugin = R.uncurryN(
  2,
  name => addOrUpdateProp(
    'plugins',
    b.arrayExpression([]),
    R.compose(
      ensureStringInArray(name),
      R.unless(
        n.ArrayExpression.check,
        R.always(b.arrayExpression([])),
      ),
    ),
  ),
)

/**
 * Ensure that specified present is the last one present in eslint configuration
 *
 * @param {string} name Preset name
 * @param {ObjectExpression} object Eslint configuration as object expression
 * @returns {ObjectExpression} Updated object expression
 */
const addPreset = R.uncurryN(
  2,
  name => addOrUpdateProp(
    'extends',
    b.arrayExpression([]),
    R.compose(
      ensureStringAtTheEndOfArray(name),
      R.unless(
        n.ArrayExpression.check,
        R.compose(
          b.arrayExpression,
          R.of,
        ),
      ),
    ),
  ),
)

/**
 * Adds rule to the rules section of eslintrc
 *
 * @param {string} name Rule name
 * @param {string} _default Default value
 * @param {ObjectExpression} object Eslint configuration as object expression
 * @returns {ObjectExpression} Updated object expression
 */
const addRule = R.uncurryN(
  3,
  name => _default => addOrUpdateProp(
    'rules',
    b.objectExpression([]),
    R.compose(
      addOrUpdateProp(
        name,
        b.literal('error'),
        R.identity,
      ),
      R.unless(
        n.ObjectExpression.check,
        R.always(b.objectExpression([])),
      ),
    )
  )
)


/**
 * Returns true when expression statement is an assignment expression
 *
 * @param {Node} statement Expression statement
 * @returns {bool} Result
 */
const isAssignmentExpression = R.both(
  n.ExpressionStatement.check,
  R.compose(
    n.AssignmentExpression.check,
    R.prop('expression'),
  ),
);

/**
 * Returns true when StaticMember expression references `module.exports`.
 *
 * @param {StaticMemberExpression} node Static member expression
 * @returns {bool} Result
 */
const isModuleExports = R.both(
  R.compose(R.equals('module'), R.path(['object', 'name'])),
  R.compose(R.equals('exports'), R.path(['property', 'name'])),
);

/**
 * Update module AST using specified function.
 *
 * Applies specified functin to the node corresponding to the value assigned to
 * module.exports
 *
 * @param {func} fn Function to update the value node
 * @param {Object} ast Complete module AST
 * @returns {Object} Updated AST
 */
const updateModuleExportsAssignment = R.uncurryN(
  2,
  fn => R.over(
    R.lensPath(['program', 'body']),
    R.map(
      R.when(
        R.both(
          isAssignmentExpression,
          R.compose(
            isModuleExports,
            R.path(['expression', 'left'])
          )
        ),
        R.over(
          R.lensProp('expression'),
          fn,
        )
      )
    )
  )
)


/**
 * Adds prettier extras to AST from .eslintrc.js.
 *
 * @param {Object} ast Original AST
 * @returns {Object} Updated AST
 */
const updateAst = updateModuleExportsAssignment(
  R.over(
    R.lensProp('right'),
    R.pipe(
      addPreset('prettier'),
      addPlugin('prettier'),
      addRule('prettier/prettier', b.literal('error')),
    )
  )
)

/**
 * Returns modified sources for .eslintrc.js with prettier extras added.
 *
 * @param {string} code Original source code
 * @param {string} Modified source code
 */
const updateEslintrcContents = (code) => {
  const ast = recast.parse(code);
  const newAst = updateAst(ast);

  return recast.print(newAst).code;
}


module.exports = updateEslintrcContents;

Object.assign(module.exports, {
  arrayContainsString,
  propNameEquals,
  createKey,
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
});
