FROM node:14-alpine as builder

ARG KANJIMI_NGINX_REMOVE_TEST_PAGES
ARG KANJIMI_NGINX_DOMAIN

COPY --chown=root:root ./src /kanjimi/src
COPY --chown=root:root ./www /kanjimi/www
COPY --chown=root:root ./package.json /kanjimi/package.json
COPY --chown=root:root ./package-lock.json /kanjimi/package-lock.json
COPY --chown=root:root ./tsconfig.json /kanjimi/tsconfig.json

WORKDIR /kanjimi

RUN NODE_ENV=development npm install --ignore-scripts --loglevel=error
RUN NODE_ENV=production ./node_modules/.bin/webpack \
    --config=src/WebApp/webpack.config.js \
    --hide-modules \
    --build

RUN if [ "$KANJIMI_NGINX_REMOVE_TEST_PAGES" == "true" ] ; then \
        rm -Rf /kanjimi/www/test-pages; \
    fi

RUN mkdir -p /etc/ssl/certs
RUN apk add openssl
RUN openssl req \
    -x509 \
    -nodes \
    -newkey rsa:2048 \
    -keyout /etc/ssl/certs/kanjimi.key \
    -out /etc/ssl/certs/kanjimi.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$KANJIMI_NGINX_DOMAIN"
RUN chmod a+r-w -R /etc/ssl/certs/kanjimi.*

FROM nginx:1-alpine
LABEL Description="Kanjimi nginx"

COPY ./dist/nginx/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /kanjimi/www /kanjimi/www
COPY --from=builder /etc/ssl/certs /etc/ssl/certs

ENV KANJIMI_NGINX_CERTIFICATE_KEY=/etc/ssl/certs/kanjimi.key
ENV KANJIMI_NGINX_CERTIFICATE_CRT=/etc/ssl/certs/kanjimi.crt

EXPOSE 443
EXPOSE 80
