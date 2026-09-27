#!/bin/sh
# Builds vogel-insel.html (local, double-click to play) and dist/artifact.html (for publishing).
set -e
cd "$(dirname "$0")"
mkdir -p dist
{
  cat src/head.html
  cat src/markup.html
  echo '<script>'
  cat src/content.js src/core.js src/quiz.js src/sprites.js src/world.js src/battle.js src/games.js src/exam.js src/ui.js
  echo '</script>'
} > dist/artifact.html
{
  echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
  cat dist/artifact.html
  echo '</body></html>'
} > vogel-insel.html
echo "built: vogel-insel.html ($(wc -c < vogel-insel.html) bytes)"
