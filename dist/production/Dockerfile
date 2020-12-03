FROM node:14-alpine
LABEL Description="Kanjimi server"

ARG SERVER_HOSTNAME
ARG KANJIMI_SERVER_PORT
ARG KANJIMI_API_URL
ARG KANJIMI_WWW_URL

USER root

COPY --chown=root:root ./src /kanjimi/src
COPY --chown=root:root ./www /kanjimi/www
COPY --chown=root:root ./package.json /kanjimi/package.json
COPY --chown=root:root ./package-lock.json /kanjimi/package-lock.json
COPY --chown=root:root ./tsconfig.json /kanjimi/tsconfig.json

WORKDIR /kanjimi

RUN mkdir -p /kanjimi/dist/server/ \
    && apk add --no-cache openssl \
    && openssl req \
        -x509 \
        -nodes \
        -newkey rsa:2048 \
        -keyout /kanjimi/dist/server/certificate.key \
        -out /kanjimi/dist/server/certificate.crt \
        -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$SERVER_HOSTNAME" \
    && apk del --no-cache openssl \
    && adduser --disabled-password --gecos '' kanjimi \
    && npm install --ignore-scripts --loglevel=error \
    && NODE_ENV=production ./node_modules/.bin/webpack \
        --config=src/WebApp/webpack.config.js \
        --hide-modules \
        --build \
    && NODE_ENV=production ./node_modules/.bin/tsc \
        --incremental \
        -p ./src/Server/tsconfig.json \
    && npm prune --production --loglevel=error

ENV NODE_ENV=production
ENV NODE_PATH=dist/server/
ENV KANJIMI_SERVER_CERTIFICATE_KEY=/kanjimi/dist/server/certificate.key
ENV KANJIMI_SERVER_CERTIFICATE_CRT=/kanjimi/dist/server/certificate.crt
ENV KANJIMI_ALLOW_TEST_PAGES=false

USER kanjimi
CMD node --expose-gc dist/server/Server/server.js
HEALTHCHECK --interval=15s --timeout=3s --retries=3 --start-period=2m CMD wget -q https://localhost:3000/api/health-check/ -O /dev/null --no-check-certificate
EXPOSE 3000
