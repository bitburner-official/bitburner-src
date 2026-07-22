/* eslint-disable @typescript-eslint/no-var-requires */
const { app } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const log = require("electron-log");

class MissingVcRuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

function isVcRuntimeInstalled() {
  // Electron only supports 64-bit Windows on modern versions, so checking the 64-bit runtime DLL in System32 is
  // sufficient. SysWOW64 and registry checks are unnecessary.
  return fs.existsSync(path.join(process.env.SystemRoot || "C:\\Windows", "System32", "vcruntime140.dll"));
}

function verifyLibraryFiles() {
  const basePath = path.join(app.getAppPath(), "node_modules", "@catloversg", "steamworks.js", "dist");
  let folderPath;
  let requiredFiles;
  switch (process.platform) {
    case "win32": {
      folderPath = path.join(basePath, "win64");
      requiredFiles = ["steam_api64.dll", "steamworksjs.win32-x64-msvc.node"];
      break;
    }
    case "linux": {
      folderPath = path.join(basePath, "linux64");
      requiredFiles = ["libsteam_api.so", "steamworksjs.linux-x64-gnu.node"];
      break;
    }
    case "darwin": {
      folderPath = path.join(basePath, "osx");
      requiredFiles = ["libsteam_api.dylib", "steamworksjs.darwin-x64.node", "steamworksjs.darwin-arm64.node"];
      break;
    }
    default:
      return { success: false, error: new Error(`Invalid platform: ${process.platform}`) };
  }
  const missingFiles = [];
  for (const file of requiredFiles) {
    const filePath = path.join(folderPath, file);
    if (fs.existsSync(filePath)) {
      continue;
    }
    missingFiles.push(file);
  }
  if (missingFiles.length > 0) {
    return { success: false, error: new Error(`Cannot find ${missingFiles.join(",")}`) };
  }
  return { success: true };
}

/** Steam integration is optional. Players can disable it by passing the --no-steam flag. */
let steamworks;
try {
  if (!process.argv.includes("--no-steam")) {
    steamworks = require("@catloversg/steamworks.js");
  } else {
    log.info("Steam integration was disabled by --no-steam flag");
  }
} catch (error) {
  log.error(error);
  log.info(
    process.report.getReport().header.osName,
    process.report.getReport().header.osRelease,
    process.report.getReport().header.osVersion,
    process.report.getReport().header.osMachine,
  );
  // Check whether required native library files exist, in case the installation is incomplete or corrupted.
  const result = verifyLibraryFiles();
  if (!result.success) {
    global.steamworksError = result.error;
  } else if (process.platform === "win32" && !isVcRuntimeInstalled()) {
    // steamworksjs.win32-x64-msvc.node depends on vcruntime140.dll.
    global.steamworksError = new MissingVcRuntimeError("You need to install Visual C++ v14 Redistributable.");
  } else if (process.platform === "linux" && error instanceof Error && error.message.includes("GLIBC_")) {
    // The native module depends on newer glibc versions that are unavailable on some older Linux distributions,
    // including still-supported RHEL8-based systems.
    global.steamworksError = new Error(
      `Your OS version is too outdated: ${process.report.getReport().header.osRelease}.`,
    );
  } else {
    global.steamworksError = error;
  }
}

/** @type {ReturnType<typeof import("@catloversg/steamworks.js").init> | undefined} */
let steamworksClient = undefined;
try {
  // 1812820 is our Steam App ID.
  steamworksClient = steamworks?.init(1812820);
} catch (error) {
  if (error instanceof Error) {
    log.warn(error.message);
    global.steamworksError = error;
  } else {
    // This should never happen.
    log.error("steamworks.js threw an error that is not an instance of Error");
    log.error(error);
    global.steamworksError = new Error(typeof error === "string" ? error : String(error), { cause: error });
  }
}

module.exports = {
  MissingVcRuntimeError,
  steamworksClient,
};
