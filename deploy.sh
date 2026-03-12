#!/usr/bin/env bash
# Carga nvm y despliega a Firebase. Úsalo si en tu terminal no tienes npm/npx.
set -e
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi
cd "$(dirname "$0")"
echo "Building..."
npm run build:production
echo "Deploying to Firebase..."
npx firebase-tools deploy --only hosting
echo "Done."
