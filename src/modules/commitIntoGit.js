import { promisify } from "util";
import childProcess from "child_process";
import { skipWhen } from "../helpers/modules";

const shouldSkip = async ({ options, environment, feedback }) => {
  if (!options["commit"]) {
    return true;
  }

  if (!await environment.findExecutable("git")) {
    feedback.info("Git executable is not available");

    return true;
  }

  return false;
};

export const enhance = skipWhen(shouldSkip);

export const commitIntoGit = async () =>
  promisify(
    childProcess.exec
  )('git commit --all --edit --message "Installed prettier"', {
    stdio: "inherit"
  });

export default enhance(commitIntoGit);
