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

kubectl apply \
    --filename ./dist/kubernetes/namespace.yaml \
    --filename ./dist/kubernetes/config.yaml \
    --filename ./dist/kubernetes/server-deployment.yaml \
    --filename ./dist/kubernetes/server-service.yaml \
    --filename ./dist/kubernetes/server-hpa.yaml \
    --prune \
    --all

kubectl rollout restart deployment server-deployment --namespace=kanjimi

# TODO handle the configs and environment variables
# TODO remove certificate from the node server since will be the same pod
# TODO simplify and optimize the image build time by using the aliases
