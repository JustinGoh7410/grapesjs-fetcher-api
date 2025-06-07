#!/bin/bash

echo "Installing Puppeteer Chromium..."
npx puppeteer browsers install chrome || exit 1
