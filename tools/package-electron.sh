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

BUILD_PLATFORM="${1:-"all"}"
# And finally build the app.
npm run electron:packager-$BUILD_PLATFORM
