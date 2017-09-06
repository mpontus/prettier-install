import { allPassP, anyPassP } from "../fp";

describe("fp", () => {
  describe("allPassP", () => {
    it("should pass input argument to every predicate", async () => {
      const fn = jest.fn(() => Promise.resolve(true));

      await allPassP([
        () => Promise.resolve(true),
        fn,
        () => Promise.resolve(true)
      ])("foo");

      expect(fn).toHaveBeenCalledWith("foo");
    });

    it("should return true when all predicates return true", async () => {
      const result = await allPassP([
        () => Promise.resolve(true),
        () => Promise.resolve(true)
      ])(null);

      expect(result).toBe(true);
    });

    it("should return false when any of the predicates return false", async () => {
      const result = await allPassP([
        () => Promise.resolve(true),
        () => Promise.resolve(false)
      ])(null);

      expect(result).toBe(false);
    });

    it("should not attempt predicates following the failed one", async () => {
      const fn = jest.fn();
      const result = await allPassP([() => Promise.resolve(false), fn])();

      expect(fn).toHaveBeenCalledTimes(0);
    });
  });
  describe("anyPassP", () => {
    it("should pass input argument to every predicate", async () => {
      const fn = jest.fn(() => Promise.resolve(false));

      await anyPassP([
        () => Promise.resolve(false),
        fn,
        () => Promise.resolve(false)
      ])("foo");

      expect(fn).toHaveBeenCalledWith("foo");
    });

    it("should return true when any predicate return true", async () => {
      const result = await anyPassP([
        () => Promise.resolve(true),
        () => Promise.resolve(false)
      ])(null);

      expect(result).toBe(true);
    });

    it("should return false when all of the predicates return false", async () => {
      const result = await anyPassP([
        () => Promise.resolve(false),
        () => Promise.resolve(false)
      ])(null);

      expect(result).toBe(false);
    });

    it("should not attempt predicates following the successful one", async () => {
      const fn = jest.fn();
      const result = await anyPassP([() => Promise.resolve(true), fn])();

      expect(fn).toHaveBeenCalledTimes(0);
    });
  });
});
