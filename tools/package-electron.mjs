import { packager } from "@electron/packager";
import { spawn } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";

async function prepareDirectories() {
  await rm(".package", { recursive: true, force: true });
  await mkdir(".package", { recursive: true });

  await rm(".build", { recursive: true, force: true });
  await mkdir(".build", { recursive: true });
}

/**
 * @returns {Promise<void>}
 */
function installElectronDependencies() {
  return new Promise((resolve, reject) => {
    // On Windows, modern Node.js versions will error with EINVAL when passing .cmd/.bat files (npm.cmd in this case)
    // directly to child_process.spawn without shell:true. Using shell:true avoids this, but triggers DEP0190 when
    // passing argument arrays.
    // To avoid both issues, we invoke cmd.exe explicitly and execute npm via /c.
    // cmd.exe /c runs the command and terminates immediately after execution.
    const isWin = process.platform === "win32";
    const command = isWin ? "cmd.exe" : "npm";
    const args = isWin ? ["/c", "npm", "install"] : ["install"];

    const child = spawn(command, args, {
      cwd: "electron",
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      code === 0 ? resolve() : reject(new Error(`npm exited with ${code}`));
    });
    child.on("error", reject);
  });
}

async function copyFiles() {
  await cp(".app", ".package", { recursive: true });
  await cp("electron", ".package", { recursive: true });
}

/** @satisfies {Partial<import("@electron/packager").Options>} */
const commonPackagerOptions = {
  dir: ".package",
  name: "bitburner",
  out: ".build",
  overwrite: true,
  appCopyright: "Copyright (C) 2026 Bitburner",
};

async function packageWin() {
  await packager({
    ...commonPackagerOptions,
    platform: "win32",
    arch: ["x64", "arm64"],
    icon: ".package/icon.ico",
    asar: {
      unpack: "**/node_modules/@catloversg/steamworks.js/**/*.{dll,node}",
    },
  });
}

async function packageLinux() {
  await packager({
    ...commonPackagerOptions,
    platform: "linux",
    arch: ["x64", "arm64"],
    asar: {
      unpack: "**/node_modules/@catloversg/steamworks.js/**/*.{so,node}",
    },
  });
}

async function packageMac() {
  await packager({
    ...commonPackagerOptions,
    platform: "darwin",
    arch: "universal",
    icon: ".package/icon.icns",
    asar: {
      unpack: "**/node_modules/@catloversg/steamworks.js/**/*.{dylib,node}",
    },
    osxUniversal: {
      x64ArchFiles: "Contents/Resources/app.asar.unpacked/node_modules/@catloversg/steamworks.js/dist/osx/*.node",
    },
  });
}

async function main() {
  await prepareDirectories();
  await installElectronDependencies();
  await copyFiles();

  const buildPlatform = process.argv[2] ?? "all";
  switch (buildPlatform) {
    case "win":
      await packageWin();
      break;

    case "linux":
      await packageLinux();
      break;

    case "mac":
      await packageMac();
      break;

    default:
      await packageWin();
      await packageLinux();
      await packageMac();
      break;
  }
}

await main();
