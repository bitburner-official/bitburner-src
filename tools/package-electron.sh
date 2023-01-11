#!/bin/bash

# Clear out any files remaining from old builds and recreate folder
rm -rf .package
mkdir .package

# .app should have the fully built game already after npm run build
cp -r .app/* .package
cp -r electron/* .package

# steam_appid.txt would end up in the resource dir
rm .package/steam_appid.txt

# Install electron sub-dependencies
cd electron
npm install
cd ..

BUILD_PLATFORM="${1:-"all"}"
# And finally build the app.
npm run electron:packager-$BUILD_PLATFORM

echo .build/* | xargs -n 1 cp electron/steam_appid.txt
