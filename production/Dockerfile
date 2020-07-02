FROM node:14-alpine
LABEL Description="Kanjimi server"

ARG SERVER_HOSTNAME

USER root

COPY --chown=root:root ./src /app/src
COPY --chown=root:root ./www /app/www
COPY --chown=root:root ./package.json /app/package.json
COPY --chown=root:root ./package-lock.json /app/package-lock.json
COPY --chown=root:root ./tsconfig.json /app/tsconfig.json
RUN chmod a+r-w -R /app
WORKDIR /app

RUN apk add --no-cache openssh
RUN mkdir -p ./production/server-certificate

RUN openssl req -nodes \
    -newkey rsa:2048 \
    -keyout ./server/certificate.key \
    -out ./server/certificate.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$SERVER_HOSTNAME"

RUN chmod a+r ./production/server-certificate/*

RUN npm install --ignore-scripts
RUN NODE_ENV=production ./node_modules/.bin/webpack --config=src/WebApp/webpack.config.js --build
RUN NODE_ENV=production ./node_modules/.bin/tsc --incremental -p ./src/Server/tsconfig.json
RUN npm prune --production

RUN adduser --disabled-password --gecos '' kanjimi

ENV NODE_ENV=production
ENV NODE_PATH=server/
ENV KANJIMI_SERVER_CERTIFICATE_KEY=./server/certificate.key
ENV KANJIMI_SERVER_CERTIFICATE_CRT=./server/certificate.crt
ENV KANJIMI_SERVER_PORT=3000
ENV KANJIMI_ALLOW_TEST_PAGES=false

USER kanjimi
CMD node --expose-gc server/Server/server.js
HEALTHCHECK --interval=15s --timeout=3s --retries=3 --start-period=2m CMD wget -q https://localhost:3000/api/health-check/ -O /dev/null --no-check-certificate
EXPOSE 3000
