import childProcess from "child_process";
import { runPrettier, enhancer } from "../runPrettier";

jest.mock("child_process");

describe("runPrettier", () => {
  it("runs the module when prettier is installed", async () => {
    const context = {
      options: {},
      environment: {
        getInstalledModules: () => Promise.resolve(["prettier"])
      },
      feedback: { progress: () => () => {} },
    };
    const fn = jest.fn();

    await enhancer(fn)(context);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("skips when --no-run option is present", async () => {
    const context = {
      options: {
        "no-run": true
      },
      environment: {
        getInstalledModules: () => Promise.resolve(["prettier"])
      },
      feedback: { progress: () => () => {} },
    };
    const fn = jest.fn();

    await enhancer(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("skips when prettier is not installed", async () => {
    const context = {
      options: {},
      environment: {
        getInstalledModules: () => Promise.resolve([])
      },
      feedback: { progress: () => () => {} },
    };
    const fn = jest.fn();

    await enhancer(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("runs prettier", async () => {
    childProcess.exec.mockImplementationOnce((command, callback) => callback());

    await runPrettier();

    expect(childProcess.exec).toHaveBeenCalledWith(
      "./node_modules/.bin/prettier --write **/*.js",
      expect.any(Function),
    );
  });
});
