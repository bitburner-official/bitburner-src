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

interface IErrorMetadata {
  error: Record<string, unknown>;
  errorInfo?: React.ErrorInfo;
  page?: Page;

  environment: GameEnv;
  platform: Platform;
  version: GameVersion;
  features: BrowserFeatures;
}

export interface IErrorData {
  metadata: IErrorMetadata;

  title: string;
  body: string;

  features: string;
  fileName?: string;

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
    errorMessage += `\nStack: ${errorData.stack}`;
  }
  if (errorData.causeAsString) {
    errorMessage += `\nError cause: ${errorData.causeAsString}`;
    if (errorData.causeStack) {
      errorMessage += `\nCause stack: ${errorData.causeStack}`;
    }
  }
  return errorMessage;
}

export function getErrorMetadata(error: unknown, errorInfo?: React.ErrorInfo, page?: Page): IErrorMetadata {
  const isElectron = navigator.userAgent.toLowerCase().includes(" electron/");
  const env = process.env.NODE_ENV === "development" ? GameEnv.Development : GameEnv.Production;
  const version: GameVersion = {
    version: CONSTANTS.VersionString,
    commitHash: commitHash(),
    toDisplay: () => `v${CONSTANTS.VersionString} (${commitHash()})`,
  };
  const features: BrowserFeatures = {
    userAgent: navigator.userAgent,

    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    indexedDb: !!window.indexedDB,
  };
  const errorObj = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : {};
  const metadata: IErrorMetadata = {
    platform: isElectron ? Platform.Steam : Platform.Browser,
    environment: env,
    version,
    features,
    error: errorObj,
    errorInfo,
    page,
  };
  return metadata;
}

export function getErrorForDisplay(error: unknown, errorInfo?: React.ErrorInfo, page?: Page): IErrorData {
  const metadata = getErrorMetadata(error, errorInfo, page);
  const errorData = parseUnknownError(error);
  const fileName = String(metadata.error.fileName);
  const features =
    `lang=${metadata.features.language} cookiesEnabled=${metadata.features.cookiesEnabled.toString()}` +
    ` doNotTrack=${metadata.features.doNotTrack ?? "null"} indexedDb=${metadata.features.indexedDb.toString()}`;

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
${metadata.errorInfo?.componentStack}
\`\`\`

### Save
\`\`\`
Copy your save here if possible
\`\`\`
`.trim();

  const issueUrl = `${newIssueUrl}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

  const data: IErrorData = {
    metadata,
    fileName,
    features,
    title,
    body,
    issueUrl,
  };
  return data;
}
