// TODO: try fs-extra
import R from "ramda";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import childProcess from "child_process";

export async function getProjectDependencies() {
  let projectMetadata;

  try {
    const projectMetadataContents = await promisify(fs.readFile)(
      "package.json",
      "utf8"
    );

    projectMetadata = JSON.parse(projectMetadataContents);
  } catch (error) {
    return {};
  }

  const { dependencies, devDependencies } = projectMetadata;

  return Object.assign({}, dependencies, devDependencies);
}

export function getInstalledModules() {
  return promisify(fs.readDir)("node_modules");
}

export async function getPackageScripts() {
  let projectMetadata;

  try {
    const projectMetadataContents = await promisify(fs.readFile)(
      "package.json",
      "utf8"
    );

    projectMetadata = JSON.parse(projectMetadataContents);
  } catch (error) {
    return {};
  }

  return projectMetadata.scripts || {};
}

export function pathExists(path) {
  return promisify(fs.access)(path).then(() => true, () => false);
}

export function findExecutable(name) {
  const isExecutable = path => promisify(fs.access)(path, fs.constants.X_OK);

  return process.env.PATH
    .split(":")
    .map(dir => path.resolve(dir, name))
    .reduceRight(
      (next, path) => () => isExecutable(path).then(() => path, () => next()),
      () => Promise.resolve(null)
    )();
}

export async function getPackager() {
  if (await findExecutable("yarn")) {
    return "yarn";
  }

  if (await findExecutable("npm")) {
    return "npm";
  }

  return null;
}

export function isCleanWorkingTree() {
  return promisify(childProcess.exec)("git diff-index --quiet HEAD --").then(
    () => true,
    error => {
      if (error.code === 1) {
        return false;
      }

      return Promise.reject(error);
    }
  );
}

export function findEslintrc() {
  const fileExists = filename =>
    promisify(fs.access)(filename).then(() => true, () => false);

  const jsonFileHasSection = section => filename =>
    promisify(fs.readFile)(filename).then(
      contents => section in JSON.parse(contents)
    );

  const files = [
    ".eslintrc.js",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    ".eslintrc.json",
    ".eslintrc",
    "package.json"
  ];

  const tests = {
    ".eslintrc.js": [fileExists],
    ".eslintrc.yaml": [fileExists],
    ".eslintrc.yml": [fileExists],
    ".eslintrc.json": [fileExists],
    ".eslintrc": [fileExists],
    "package.json": [fileExists, jsonFileHasSection("eslintConfig")]
  };

  return files.reduceRight(
    (next, path) => () =>
      tests[path].reduceRight(
        (next, pred) => () => pred(path).then(result => result && next()),
        () => Promise.resolve(true)
      )().then(result => (result ? path : next())),
    () => Promise.resolve(null)
  )();
}

export async function getEslintConfig() {
  const filename = await this.findEslintrc();

  switch (filename) {
    case ".eslintrc.json":
      return promisify(fs.readFile)(filename, "utf8").then(contents =>
        JSON.parse(contents)
      );
    case "package.json":
      return promisify(fs.readFile)(filename, "utf8")
        .then(contents => JSON.parse(contents))
        .then(metadata => metadata.eslintConfig || {});
    case null:
      throw new Error("Eslint configuration file is not found");
    default:
      throw new Error(
        `Eslint configuration in file ${filename} is not supported`
      );
  }
}

export function eslintPresets() {
  return this.getEslintConfig()
    .then(config => config.extends || [])
    .then(presets => (Array.isArray(presets) ? presets : [presets]));
}

export function eslintPlugins() {
  return this.getEslintConfig().then(config => config.plugins || []);
}

export function eslintRules() {
  return this.getEslintConfig().then(config => config.rules || {});
}
