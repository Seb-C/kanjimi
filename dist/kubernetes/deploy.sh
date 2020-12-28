#!/bin/bash

set -e

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

#docker build \
#    -t registry.digitalocean.com/kanjimi/kanjimi:server \
#    --build-arg NODE_ENV=production \
#    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
#    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
#    -f ./dist/docker/server.Dockerfile \
#    .
#docker build \
#    -t registry.digitalocean.com/kanjimi/kanjimi:nginx \
#    --build-arg KANJIMI_NGINX_REMOVE_TEST_PAGES=true \
#    --build-arg KANJIMI_NGINX_CERTIFICATE_DOMAIN=www.kanjimi.com \
#    --build-arg KANJIMI_API_URL=https://www.kanjimi.com/api \
#    --build-arg KANJIMI_WWW_URL=https://www.kanjimi.com \
#    -f ./dist/docker/nginx.Dockerfile \
#    .

#docker push registry.digitalocean.com/kanjimi/kanjimi:server
#docker push registry.digitalocean.com/kanjimi/kanjimi:nginx

kubectl apply \
    --filename ./dist/kubernetes/generated/secret-https-certificate.yaml \
    --filename ./dist/kubernetes/config.yaml \
    --filename ./dist/kubernetes/config-fluentbit.yaml \
    --filename ./dist/kubernetes/fluentbit-daemonset.yaml \
    --filename ./dist/kubernetes/server-deployment.yaml \
    --filename ./dist/kubernetes/server-hpa.yaml \
    --filename ./dist/kubernetes/server-service.yaml \
    --namespace default \
    --prune \
    --all

kubectl rollout restart deployment server-deployment --namespace=default
