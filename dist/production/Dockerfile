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

RUN apk add --no-cache openssl
RUN mkdir -p /kanjimi/dist/server/
RUN openssl req \
    -x509 \
    -nodes \
    -newkey rsa:2048 \
    -keyout /kanjimi/dist/server/certificate.key \
    -out /kanjimi/dist/server/certificate.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$SERVER_HOSTNAME"

RUN adduser --disabled-password --gecos '' kanjimi
RUN chmod a+r-w -R /kanjimi
WORKDIR /kanjimi

RUN npm install --ignore-scripts --loglevel=error
RUN NODE_ENV=production ./node_modules/.bin/webpack --config=src/WebApp/webpack.config.js --hide-modules --build
RUN NODE_ENV=production ./node_modules/.bin/tsc --incremental -p ./src/Server/tsconfig.json
RUN npm prune --production --loglevel=error

ENV NODE_ENV=production
ENV NODE_PATH=dist/server/
ENV KANJIMI_SERVER_CERTIFICATE_KEY=./dist/server/certificate.key
ENV KANJIMI_SERVER_CERTIFICATE_CRT=./dist/server/certificate.crt
ENV KANJIMI_ALLOW_TEST_PAGES=false

USER kanjimi
CMD node --expose-gc dist/server/Server/server.js
HEALTHCHECK --interval=15s --timeout=3s --retries=3 --start-period=2m CMD wget -q https://localhost:3000/api/health-check/ -O /dev/null --no-check-certificate
EXPOSE 3000
