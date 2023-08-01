#!/bin/bash

echo "Bundling ingame documentation..."
node tools/bundle-doc/index.js

echo ""
echo "Using API Extractor to generate mappings for Netscript API definitions..."
npx api-extractor run

echo ""
echo "Creating markdown from Netscript API mappings..."
npx api-documenter markdown

echo ""
echo "Running cleanup tasks..."
rm input/bitburner.api.json && rm -r input

# This git add is needed due to documenter using wrong line endings. Console spam discarded.
git add markdown/ 2> /dev/null && git add tsdoc-metadata.json 2> /dev/null
echo ""
echo "Documentation build completed."
