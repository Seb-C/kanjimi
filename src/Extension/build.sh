#!/bin/bash

set -e

docker run \
    -v ${PWD}:/kanjimi:delegated \
    -w /kanjimi \
    --env NODE_ENV=production \
    --env KANJIMI_API_URL=https://www.kanjimi.com/api \
    --env KANJIMI_WWW_URL=https://www.kanjimi.com \
    --init \
    --interactive \
    --rm \
    node:14-alpine \
    ./node_modules/.bin/webpack \
    --config=src/Extension/webpack.config.js \
    --color \
    --build

./node_modules/.bin/web-ext build \
    --source-dir ./dist/extension-prod/ \
    --overwrite-dest \
    --artifacts-dir ./dist/
