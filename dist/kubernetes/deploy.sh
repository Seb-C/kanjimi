#!/bin/bash

set -e

doctl registry login

docker build \
    -t registry.digitalocean.com/kanjimi/server:latest \
    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
    -f ./dist/docker/server.Dockerfile \
    .
docker build \
    -t registry.digitalocean.com/kanjimi/nginx:latest \
    -f ./dist/docker/nginx.Dockerfile \
    .

docker push registry.digitalocean.com/kanjimi/server:latest
docker push registry.digitalocean.com/kanjimi/nginx:latest

kubectl apply \
    --build-arg KANJIMI_NGINX_DOMAIN=www.kanjimi.com \
    --filename ./dist/kubernetes/namespace.yaml \
    --filename ./dist/kubernetes/config.yaml \
    --filename ./dist/kubernetes/server-deployment.yaml \
    --filename ./dist/kubernetes/server-service.yaml \
    --filename ./dist/kubernetes/server-hpa.yaml \
    --prune \
    --all

kubectl rollout restart deployment server-deployment --namespace=kanjimi

# TODO simplify and optimize the image build time by using the aliases
# TODO Remove useless configs
# TODO nginx: serve www files directly
# TODO load balancer
# TODO logging
# TODO fix ports
