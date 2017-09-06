import { promisify } from "util";
import fs from "fs";
import R from "ramda";
import { skipWhen, withProgress, hasOption } from "../helpers/modules";
import modifyFile, { writeFile } from "../helpers/modifyFile";
import processJson, { stringifyJson } from "../helpers/processJson";
import { anyPassP } from "../helpers/fp";

const fileExists = filename =>
  promisify(fs.access)(filename).then(() => true, () => false);

const sameConfig = async ({ environment, options }) =>
  R.equals(await environment.getPrettierOptions(), options.prettierOptions);

export const enhance = R.compose(
  skipWhen(
    anyPassP([
      // Skip when no prettier options are provided
      R.complement(hasOption("prettierOptions")),
      // Skip when prettier options are the same
      sameConfig
    ])
  ),
  withProgress("Updating prettier config")
);

export const updatePrettierConfig = async ({ environment, options }) => {
  if (await fileExists(".prettierrc")) {
    return modifyFile(
      processJson(R.always(options.prettierOptions)),
      ".prettierrc"
    );
  }

  return writeFile(".prettierrc", stringifyJson(2, options.prettierOptions));
};

export default enhance(updatePrettierConfig);
