#!/bin/sh
# Builds the 3D game:
#   vogel-insel.html  -> play locally (needs the folders vendor/ and audio/ next to it)
#   dist/index.html   -> artifact version (three.js from cdnjs, audio published alongside)
set -e
cd "$(dirname "$0")"
mkdir -p dist/audio
PACKS=$(ls audio | grep -E '^voice-[0-9]+\.js$' | sort -V | sed 's#^#"audio/#; s#$#"#' | paste -sd, -)
JS="src/content.js src3d/core.js src/quiz.js src3d/engine.js src3d/models.js src3d/world.js src3d/activities.js src3d/exam.js src3d/ui.js"
body() {
  cat src3d/head.html src3d/markup.html
  echo "<script src=\"$1\"></script>"
  echo "<script>window.VOICE_PACKS=[$PACKS];</script>"
  echo '<script>'
  cat $JS
  echo '</script>'
}
body "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" > dist/index.html
cp audio/voice-*.js dist/audio/
{
  echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
  body "vendor/three.min.js"
  echo '</body></html>'
} > vogel-insel.html
cp vogel-insel.html index.html
echo "built: vogel-insel.html + index.html ($(wc -c < vogel-insel.html) bytes), dist/index.html, $(ls dist/audio | wc -l | tr -d ' ') voice packs"
