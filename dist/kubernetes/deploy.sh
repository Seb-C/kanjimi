#!/bin/bash

set -e

doctl registry login

docker build \
    -t registry.digitalocean.com/kanjimi/kanjimi:server \
    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
    --build-arg NODE_ENV=production \
    -f ./dist/docker/server.Dockerfile \
    .
docker build \
    -t registry.digitalocean.com/kanjimi/kanjimi:nginx \
    --build-arg KANJIMI_NGINX_REMOVE_TEST_PAGES=true \
    --build-arg KANJIMI_NGINX_DOMAIN=www.kanjimi.com \
    -f ./dist/docker/nginx.Dockerfile \
    .

docker push registry.digitalocean.com/kanjimi/kanjimi:server
docker push registry.digitalocean.com/kanjimi/kanjimi:nginx

kubectl apply \
    --filename ./dist/kubernetes/namespace.yaml \
    --filename ./dist/kubernetes/config.yaml \
    --filename ./dist/kubernetes/server-deployment.yaml \
    --filename ./dist/kubernetes/server-service.yaml \
    --filename ./dist/kubernetes/server-hpa.yaml \
    --prune \
    --all

kubectl rollout restart deployment server-deployment --namespace=kanjimi

# TODO Remove useless configs
# TODO load balancer
# TODO logging
# TODO fix ports
