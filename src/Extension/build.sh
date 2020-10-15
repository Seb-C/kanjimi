#!/bin/bash

set -e

# Building the extension for production
docker run \
    -v ${PWD}:/kanjimi:delegated \
    -w /kanjimi \
    --env NODE_ENV=production \
    --env KANJIMI_EXTENSION_HOST=kanjimi.com \
    --env KANJIMI_API_URL=https://www.kanjimi.com/api \
    --env KANJIMI_WWW_URL=https://www.kanjimi.com \
    --init \
    --interactive \
    --tty \
    --rm \
    node:14-alpine \
    sh -c "
        ./node_modules/.bin/webpack \
            --config=src/Extension/webpack.config.js \
            --color \
            --build

        ./node_modules/.bin/web-ext build \
            --source-dir ./dist/extension-prod/ \
            --overwrite-dest \
            --artifacts-dir ./dist/
    "

# Extracting the relevants assets for the extension review process
mkdir -p ./dist/extension-review
rm -Rf ./dist/extension-review/*
touch ./dist/extension-review/.gitkeep
mkdir ./dist/extension-review/src
cp ./tsconfig.json ./dist/extension-review/
cp ./package.json ./dist/extension-review/
cp ./package-lock.json ./dist/extension-review/
cp ./src/*.d.ts ./dist/extension-review/src/
cp -R ./src/Common ./dist/extension-review/src/Common
cp -R ./src/Extension ./dist/extension-review/src/Extension
find ./dist/extension-review/src -type f -name "*.test.ts" -delete
find ./dist/extension-review/src -type f -name "*.test.js" -delete
find ./dist/extension-review/src -type f -name "*.e2e.ts" -delete
find ./dist/extension-review/src -type f -name "*.e2e.js" -delete
echo '#!/bin/bash
set -e
docker run \
    -v ${PWD}:/kanjimi:delegated \
    -w /kanjimi \
    --interactive \
    --tty \
    --init \
    --rm node:14-alpine \
    npm install --ignore-scripts
./src/Extension/build.sh
' > ./dist/extension-review/build.sh
chmod +x ./dist/extension-review/build.sh
docker run \
    -v ${PWD}:/kanjimi:delegated \
    -w /kanjimi \
    --interactive \
    --tty \
    --init \
    --rm \
    alpine \
    tar -czvf ./dist/extension-review.tar.gz ./dist/extension-review
