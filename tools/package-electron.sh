#!/bin/bash

# Clear out any files remaining from old builds and recreate folder
rm -rf .package
mkdir .package
rm -rf .build
mkdir .build

# Install electron sub-dependencies
cd electron
npm install
cd ..

# .app should have the fully built game already after npm run build
cp -r .app/* .package
cp -r electron/* .package

packageWin() {
  electron-packager .package bitburner --platform win32 --arch x64,arm64 --out .build --overwrite --icon .package/icon.ico --app-copyright "Copyright (C) 2025 Bitburner"
}

packageLinux() {
  electron-packager .package bitburner --platform linux --arch x64,arm64 --out .build --overwrite --app-copyright "Copyright (C) 2025 Bitburner"
}

packageMac() {
  electron-packager .package bitburner --platform darwin --arch universal --osx-universal.x64ArchFiles="Contents/Resources/app/node_modules/@catloversg/steamworks.js/dist/osx/*" --out .build --overwrite --icon .package/icon.icns --app-copyright "Copyright (C) 2025 Bitburner"
}

BUILD_PLATFORM="${1:-"all"}"
# And finally build the app.
case $BUILD_PLATFORM in
  "win")
    packageWin;;
  "linux")
    packageLinux;;
  "mac")
    packageMac;;
  *)
    packageWin;
    packageLinux;
    packageMac;;
esac
