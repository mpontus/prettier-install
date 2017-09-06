import fs from "fs";
import dedent from "dedent";
import { updatePrettierConfig, enhance } from "../updatePrettierConfig";

jest.mock("fs");

describe("updatePrettierConfig", () => {
  beforeEach(() => {
    fs._mockReset();
  });

  it("should dump prettier options into .prettierrc", async () => {
    const context = {
      options: {
        prettierOptions: {
          tabWidth: 2,
          semi: false
        }
      }
    };

    await updatePrettierConfig(context);

    expect(fs.writeFile).toHaveBeenCalledWith(
      ".prettierrc",
      dedent`{
        "tabWidth": 2,
        "semi": false
      }`,
      expect.any(Function)
    );
  });

  it("should override existing configuration", async () => {
    fs._mockFileContents(
      ".prettierrc",
      dedent`{
        "printWidth": 40,
        "tabWidth": 4
      }`
    );

    const context = {
      options: {
        tabWidth: 2,
        semi: false
      }
    };

    await updatePrettierConfig(context);

    expect(fs.writeFile).toHaveBeenCalledWith(
      ".prettierrc",
      dedent`{
        "tabWidth": 2,
        "semi": false
      }`,
      expect.any(Function)
    );
  });

  it("should be skipped when no prettier options are provided", async () => {
    const context = {
      options: {}
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("should be skipped when prettier options dont need updating", async () => {
    const context = {
      options: {
        prettierOptions: {
          tabWidth: 4
        }
      },
      environment: {
        getPrettierOptions: () =>
          Promise.resolve({
            tabWidth: 4
          })
      },
      feedback: {
        progress: () => () => {}
      }
    };
    const fn = jest.fn();

    await enhance(fn)(context);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
