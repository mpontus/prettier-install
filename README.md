# Pretteier Install

[Prettier](https://github.com/prettier/prettier) is an opinionated code formatter which formats your code for you.

**This package installs and configures prettier for you.**

### Requirements

 * In current stage the script requires **Node 8+** to run.

### Usage

The simplest way to run prettier-install is by using `npx`.

Change to your project directory and ensure that your working tree is clean. Then run:

```bash
npx prettier-install
```

#### What happens now?

 * Prettier will be **downloaded and installed** to your project `devDependencies` using `npm` or `yarn` if available.
 * `prettier` **script will be added** to `scripts` section of `package.json` and will **run** immediately.
 * You will be **offered to commit** the changes as a single atomic commit.<br/> *Hint: In vim you can abort commit by typing `:cq<Return>`*

#### What to do next?

* Verify that **glob patterns** passed to prettier allow it to reach all files that need formatting. Default is `**/*.js`.
* Review the **code style** applied by prettier. Review prettier documentation to see available [configuration options](https://github.com/prettier/prettier#options).
* If you are using **ESLint** then refer to the specific [integration instructions](https://github.com/prettier/prettier#eslint).

You can change glob patterns and arguments passed to prettier by modifying the `prettier` entry in the `scripts` section of your `package.json`.

Run `npm run prettier` or `yarn prettier` when you want to reformat your code, or set up [pre-commit hook](https://github.com/prettier/prettier#pre-commit-hook).

### Options

`prettier-install` accepts all formatting options recognized by `prettier`:

|Option|Default|Description|
|-|-|-|
|`--print-width <int>`|`80`|Maximum line length to wrap the line on|
|`--tab-width`|`2`|Indentation size as the number of spaces|
|`--use-tabs`|`false`|Use tabs instead of spaces for indentation|
|`--no-semi`|`false`|Omit semicolons|
|`--single-quote`|`false`|Use single quotes instead of double quotes|
|`--trailing-commas <none\|es5\|all>`|`none`|Add trailing commas everywhere (`all`), only for objects and arrays (`es5`) or never (`none`)|
|`--no-bracket-spacing`|`false`|Disable adding spaces between object brackets|
|`--jsx-bracket-same-line`|`false`|Disable carrying closing bracket in JSX tags over to a new line|

Any additional arguments are treated as glob patterns to be passed to `prettier`. If no glob pattern is supplied default `**/*.js` will be used.
