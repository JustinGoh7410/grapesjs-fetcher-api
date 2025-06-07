#!/bin/bash

set -o errexit

# 安装依赖
npm install

# 创建 Puppeteer 缓存目录
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# 安装 Chromium
npx puppeteer browsers install chrome
