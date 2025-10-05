export interface CommandGenerationOptions {
  enableServicePasswordEncryption?: boolean;
  saveConfiguration?: boolean;
  verbose?: boolean;
}

export let logger = (_: string) => {};

export function createLogger(isVerbose: boolean) {
  if (isVerbose) {
    logger = (message: string) => console.log(`[LOG] ${message}`);
  } else {
    logger = (_: string) => {};
  }
}
