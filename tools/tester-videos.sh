#!/bin/sh
# Teste la lecture réelle des vidéos de l'accueil dans un Chrome sans fenêtre (premier plan simulé).
# Prérequis : site servi en local (python3 -m http.server 8765), Google Chrome, Node 18+.
# Usage : sh tools/tester-videos.sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFIL=$(mktemp -d)
"$CHROME" --headless=new --disable-gpu --autoplay-policy=no-user-gesture-required \
  --remote-debugging-port=9333 --user-data-dir="$PROFIL" --window-size=1300,1000 about:blank >/dev/null 2>&1 &
PID=$!
sleep 3
node "$(dirname "$0")/tester-videos.js"
CODE=$?
kill $PID 2>/dev/null; sleep 1; rm -rf "$PROFIL"
exit $CODE
