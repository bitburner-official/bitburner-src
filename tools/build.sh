#!/bin/bash

# builds the game in the root folder, exit on failure
webpack --mode $1 || exit 1

# Clear out any files remaining from old builds and recreate folder
rm -rf .app
mkdir .app

# Should be all the files needed.
cp index.html .app
cp favicon.ico .app
cp -r dist .app
