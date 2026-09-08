#!/bin/sh
# Re-stamp css/js links with a content hash so browsers pick up edits.
# Run after changing anything in css/ or js/.
V=$(cat css/*.css js/*.js | cksum | cut -d' ' -f1)
for f in *.html; do
  sed -i '' -E "s|(css/style\.css)(\?v=[0-9]+)?|\1?v=$V|g; s|(js/[a-z0-9]+\.js)(\?v=[0-9]+)?|\1?v=$V|g" "$f"
done
echo "stamped v=$V"
