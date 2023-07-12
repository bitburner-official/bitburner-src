#!/bin/bash

# use API Extractor to generate technical documentation markdown 
npx api-extractor run
npx api-documenter markdown

# Move documentation to correct location
rm src/Documentation/markdown/netscriptDefinitions/*
rm -r src/Documentation/markdown/netscriptDefinitions
mv markdown/ src/Documentation/markdown/netscriptDefinitions

# Clean up some unwanted files generated above? This part doesn't seem like it was necessary
rm input/bitburner.api.json
rm -r input

# Prevent git from committing every file due to different EOF markers
# Even though this is a git add, the effect is removing unchanged files from the commit.
git add src/Documentation/markdown/api
git add tsdoc-metadata.json

# Run the autogenerator for ingame docs.
node tools/bundle-doc/index.js
