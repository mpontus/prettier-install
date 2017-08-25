export function packagerInstallCommand(packager, dependencies) {
  switch (packager) {
    case 'npm':
      return `npm install --save-dev ${dependencies.join(' ')}`
    case 'yarn':
      return `yarn add --dev ${dependencies.join(' ')}`
    default:
      throw new Error(`Unknown packager: ${packager}`);
  }
}
