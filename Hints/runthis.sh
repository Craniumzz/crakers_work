#!/usr/bin/env bash
# Lightweight "rickroll" helper: opens Rick Astley's video in your environment.
# Usage: `bash scripts/rickroll.sh` or make it executable and run `./scripts/rickroll.sh`.

URL="https://www.youtube.com/watch?v=dQw4w9WgXcQ"

echo
cat <<'EOF'
 _   _      _ _         _   _                 _ 
| | | | ___| | | ___   | \ | | ___  _ __ ___ (_)___
| |_| |/ _ \ | |/ _ \  |  \| |/ _ \| '_ ` _ \| / __|
|  _  |  __/ | | (_) | | |\  | (_) | | | | | | \__ \
|_| |_|\___|_|_|\___/  |_| \_|\___/|_| |_| |_|_|___/

Never gonna give you up
Never gonna let you down
EOF

echo "Opening Rick Roll..."

# Prefer mpv if available (plays in terminal), else try xdg-open/open, else just print the URL.
if command -v mpv >/dev/null 2>&1; then
  mpv --no-video "$URL" &>/dev/null &
  exit 0
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" &>/dev/null || true
  exit 0
fi

if command -v open >/dev/null 2>&1; then
  open "$URL" &>/dev/null || true
  exit 0
fi

# Fallback: print the URL for the user to open manually
echo "Open this URL in your browser: $URL"

exit 0
