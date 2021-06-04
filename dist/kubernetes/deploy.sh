#!/bin/bash

set -e

export DOCKER_BUILDKIT=0

echo "
apiVersion: v1
kind: Secret
metadata:
  labels:
    app: secret-https-certificate
  name: secret-https-certificate
type: Opaque
data:
  privkey.pem: $(cat ./dist/letsencrypt/live/kanjimi.com/privkey.pem | base64 -w 0)
  fullchain.pem: $(cat ./dist/letsencrypt/live/kanjimi.com/fullchain.pem | base64 -w 0)
" > ./dist/kubernetes/generated/secret-https-certificate.yaml

docker build \
    -t registry.digitalocean.com/kanjimi/kanjimi:backup \
    -f ./dist/docker/backup.Dockerfile \
    .
docker build \
    -t registry.digitalocean.com/kanjimi/kanjimi:server \
    --build-arg NODE_ENV=production \
    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
    -f ./dist/docker/server.Dockerfile \
    .
docker build \
    -t registry.digitalocean.com/kanjimi/kanjimi:nginx \
    --build-arg KANJIMI_NGINX_REMOVE_TEST_PAGES=true \
    --build-arg KANJIMI_NGINX_CERTIFICATE_DOMAIN=www.kanjimi.com \
    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
    -f ./dist/docker/nginx.Dockerfile \
    .

doctl registry login

# Commented because strangely, it causes a quota error by DO (even if it does not actually changes anything)
#docker push registry.digitalocean.com/kanjimi/kanjimi:backup
docker push registry.digitalocean.com/kanjimi/kanjimi:server
docker push registry.digitalocean.com/kanjimi/kanjimi:nginx

set +e
kubectl apply \
    --filename ./dist/kubernetes/generated/secret-https-certificate.yaml \
    --filename ./dist/kubernetes/config.yaml \
    --filename ./dist/kubernetes/config-fluentbit.yaml \
    --filename ./dist/kubernetes/backup-cronjob.yaml \
    --filename ./dist/kubernetes/fluentbit-daemonset.yaml \
    --filename ./dist/kubernetes/server-deployment.yaml \
    --filename ./dist/kubernetes/server-hpa.yaml \
    --filename ./dist/kubernetes/server-service.yaml \
    --namespace default \
    --prune \
    --all
set -e

kubectl rollout restart deployment server --namespace=default
