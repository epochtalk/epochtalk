#!/bin/bash

# medium css files
editorCSS="./node_modules/medium-editor/dist/css/medium-editor.css"
defaultCSS="./node_modules/medium-editor/dist/css/themes/default.css"

# check to see if the medium css files exists
if [ -e $editorCSS ]; then
  echo "Moving medium-editor.css to ./app/css"
  # copy the css files to app/css/
  cp "$editorCSS" ./app/css
else
  echo "medium-editor.css not found in node_modules"
  echo "Please make sure Medium-Editor is installed through npm"
fi

if [ -e $defaultCSS ]; then
  echo "Moving default.css ./app/css"
  # copy the css files to app/css/
  cp "$defaultCSS" ./app/css
else
  echo "default.css not found in node_modules"
  echo "Please make sure Medium-Editor is installed through npm"
fi