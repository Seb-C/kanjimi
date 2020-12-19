#!/bin/bash

set -e

doctl registry login

docker build \
    -t registry.digitalocean.com/kanjimi/server:latest \
    --build-arg SERVER_HOSTNAME=www.kanjimi.com \
    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
    -f ./dist/docker/server.Dockerfile \
    .

docker push registry.digitalocean.com/kanjimi/server:latest

# TODO remove certificate from the node server since will be the same pod
