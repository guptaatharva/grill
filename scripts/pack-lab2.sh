#!/usr/bin/env bash
# Packs the CSC413 Lab 2 submission from the single project folder.
# Usage: npm run pack:lab2 -- <RegNo>      e.g. npm run pack:lab2 -- 22BCE1234
# Output: dist/<RegNo>_Lab2_Grill.zip
#
# The lab needs an index.html with no JavaScript. In the project, the lab page
# is landing/viva-day.html (landing/index.html is the marketing page), so this
# copies it in as index.html and includes only the files it uses. None of the
# site's JS files (landing/js/*) go into the ZIP.
set -euo pipefail

REG="${1:?Pass your registration number, e.g. npm run pack:lab2 -- 22BCE1234}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/landing"
STAGE="$ROOT/dist/lab2"
ZIP="$ROOT/dist/${REG}_Lab2_Grill.zip"

npx --prefix "$ROOT" tailwindcss -i "$SITE/src/viva-day.input.css" -o "$SITE/css/viva-day.css" --minify

rm -rf "${STAGE:?}" && mkdir -p "$STAGE"/{css,assets,captions,src}
cp "$SITE/viva-day.html"                    "$STAGE/index.html"
cp "$SITE/css/viva-day.css"                 "$STAGE/css/"
cp "$SITE/src/viva-day.input.css"           "$STAGE/src/"
cp "$SITE"/captions/viva-tour.*.vtt         "$STAGE/captions/"
cp "$SITE"/assets/{icon.svg,viva-closeup.svg,viva-wide-dark.svg,viva-wide-light.svg,viva-tour.webm,viva-tour.mp4,viva-tour-poster.jpg} "$STAGE/assets/"
cp "$ROOT/docs/lab2/README.md"              "$STAGE/"
cp -r "$ROOT/docs/lab2/screenshots"         "$STAGE/"

# Hard constraint 1: refuse to pack if any script or inline handler slipped in.
if grep -nEi '<script|[[:space:]]on[a-z]+=' "$STAGE/index.html"; then
  echo "ERROR: JavaScript found in index.html; not packing." >&2
  exit 1
fi

rm -f "$ZIP" && (cd "$STAGE" && zip -qr "$ZIP" .)
echo "Wrote $ZIP ($(du -h "$ZIP" | cut -f1))"
