import childProcess from "child_process";
import { commitIntoGit, enhance } from "../commitIntoGit";

jest.mock("child_process");

describe("gitCommit", () => {
  it("does not run unless --commit option is present", async () => {
    const context = {
      options: {},
      environment: {},
      feedback: {
        info: () => {},
        progress: () => () => {}
      }
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("does not run unless git executable is available", async () => {
    const context = {
      options: {
        commit: true
      },
      environment: {
        findExecutable: name => {
          expect(name).toBe("git");

          return false;
        }
      },
      feedback: {
        info: () => {},
        progress: () => () => {}
      }
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("runs when --commit option is present", async () => {
    const context = {
      options: {
        commit: true
      },
      environment: {
        findExecutable: name => {
          expect(name).toBe("git");

          return true;
        }
      },
      feedback: {
        info: () => {},
        progress: () => () => {}
      }
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("executes git commit", async () => {
    childProcess.exec.mockImplementationOnce((command, options, callback) =>
      callback()
    );

    await commitIntoGit();

    expect(childProcess.exec).toHaveBeenCalledWith(
      'git commit --all --edit --message "Installed prettier"',
      { stdio: "inherit" },
      expect.any(Function)
    );
  });
});
