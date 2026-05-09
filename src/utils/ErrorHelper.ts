import type React from "react";

import type { Page } from "../ui/Router";
import { commitHash } from "./helpers/commitHash";
import { CONSTANTS } from "../Constants";

enum GameEnv {
  Production,
  Development,
}

enum Platform {
  Browser,
  Steam,
}

interface GameVersion {
  version: string;
  commitHash: string;

  toDisplay: () => string;
}

interface BrowserFeatures {
  userAgent: string;
  language: string;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  indexedDb: boolean;
}

interface CrashReportMetadata {
  error: Record<string, unknown>;
  reactErrorInfo?: React.ErrorInfo;
  page?: Page;

  environment: GameEnv;
  platform: Platform;
  version: GameVersion;
  browserFeatures: BrowserFeatures;
}

export interface CrashReport {
  metadata: CrashReportMetadata;

  title: string;
  body: string;

  issueUrl: string;
}

export const newIssueUrl = `https://github.com/bitburner-official/bitburner-src/issues/new`;

export function parseUnknownError(error: unknown): {
  errorAsString: string;
  stack?: string;
  causeAsString?: string;
  causeStack?: string;
} {
  const errorAsString = String(error);
  let stack: string | undefined = undefined;
  let causeAsString: string | undefined = undefined;
  let causeStack: string | undefined = undefined;
  if (error instanceof Error) {
    stack = error.stack;
    if (error.cause != null) {
      causeAsString = String(error.cause);
      if (error.cause instanceof Error) {
        causeStack = error.cause.stack;
      }
    }
  }
  return {
    errorAsString,
    stack,
    causeAsString,
    causeStack,
  };
}

export function getErrorMessageWithStackAndCause(error: unknown, prefix = ""): string {
  const errorData = parseUnknownError(error);
  let errorMessage = `${prefix}${errorData.errorAsString}`;
  if (errorData.stack) {
    errorMessage += `\n\nStack: ${errorData.stack}`;
  }
  if (errorData.causeAsString) {
    errorMessage += `\nError cause: ${errorData.causeAsString}`;
    if (errorData.causeStack) {
      errorMessage += `\nCause stack: ${errorData.causeStack}`;
    }
  }
  return errorMessage;
}

export function getCrashReportMetadata(
  error: unknown,
  reactErrorInfo?: React.ErrorInfo,
  page?: Page,
): CrashReportMetadata {
  const isElectron = navigator.userAgent.toLowerCase().includes(" electron/");
  const env = process.env.NODE_ENV === "development" ? GameEnv.Development : GameEnv.Production;
  const version = {
    version: CONSTANTS.VersionString,
    commitHash: commitHash(),
    toDisplay: () => `v${CONSTANTS.VersionString} (${commitHash()})`,
  };
  const browserFeatures = {
    userAgent: navigator.userAgent,

    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    indexedDb: !!window.indexedDB,
  };
  const errorObj = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : {};
  return {
    platform: isElectron ? Platform.Steam : Platform.Browser,
    environment: env,
    version,
    browserFeatures,
    error: errorObj,
    reactErrorInfo,
    page,
  };
}

export function getCrashReport(error: unknown, reactErrorInfo?: React.ErrorInfo, page?: Page): CrashReport {
  const metadata = getCrashReportMetadata(error, reactErrorInfo, page);
  const errorData = parseUnknownError(error);
  const fileName = String(metadata.error.fileName);
  const features =
    `lang=${metadata.browserFeatures.language} cookiesEnabled=${metadata.browserFeatures.cookiesEnabled.toString()}` +
    ` doNotTrack=${
      metadata.browserFeatures.doNotTrack ?? "null"
    } indexedDb=${metadata.browserFeatures.indexedDb.toString()}`;

  const title = `${metadata.error.name}: ${metadata.error.message} (at "${metadata.page}")`;
  let causeAndCauseStack = errorData.causeAsString
    ? `
### Error cause: ${errorData.causeAsString}
`
    : "";
  if (errorData.causeStack) {
    causeAndCauseStack += `Cause stack:
\`\`\`
${errorData.causeStack}
\`\`\`
`;
  }
  const body = `
## ${title}

### How did this happen?

Please fill this information with details if relevant.

- [ ] Save file
- [ ] Minimal scripts to reproduce the issue
- [ ] Steps to reproduce

### Environment

* Error: ${errorData.errorAsString ?? "n/a"}
* Page: ${metadata.page ?? "n/a"}
* Version: ${metadata.version.toDisplay()}
* Environment: ${GameEnv[metadata.environment]}
* Platform: ${Platform[metadata.platform]}
* UserAgent: ${navigator.userAgent}
* Features: ${features}
* Source: ${fileName ?? "n/a"}

### Stack Trace
\`\`\`
${errorData.stack}
\`\`\`
${causeAndCauseStack}
### React Component Stack
\`\`\`
${metadata.reactErrorInfo?.componentStack}
\`\`\`

### Save
\`\`\`
Copy your save here if possible
\`\`\`
`.trim();

  const issueUrl = `${newIssueUrl}?title=${encodeURIComponent(title.toWellFormed())}&body=${encodeURIComponent(
    body.toWellFormed(),
  )}`;

  return {
    metadata,
    title,
    body,
    issueUrl,
  };
}

export function isSaveDataFromNewerVersions(versionSave?: string): boolean {
  if (versionSave == null) {
    return false;
  }
  // The empty string and the x.y.z format are from pre-v1 versions.
  if (versionSave === "" || versionSave.includes(".")) {
    return false;
  }
  const versionNumber = Number(versionSave);
  if (!Number.isFinite(versionNumber) || versionNumber <= CONSTANTS.VersionNumber) {
    return false;
  }
  return true;
}

export function isStanekGiftImplemented(versionSave?: string): boolean {
  // It's debatable if we should return true or false here. If versionSave is undefined, there must be something wrong
  // with the loading process. I think we should return true here and let the caller show the error popup.
  if (versionSave == null) {
    return true;
  }
  // The empty string and the x.y.z format are from pre-v1 versions.
  if (versionSave === "" || versionSave.includes(".")) {
    return false;
  }
  const versionNumber = Number(versionSave);
  // Stanek's Gift was added in v1.1.0 (VersionNumber = 6).
  if (!Number.isFinite(versionNumber) || versionNumber <= 5) {
    return false;
  }
  return true;
}
