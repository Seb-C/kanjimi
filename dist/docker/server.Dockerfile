FROM node:14-alpine as builder

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
RUN NODE_ENV=production ./node_modules/.bin/tsc \
    --incremental \
    -p ./src/Server/tsconfig.json
RUN npm prune --production --loglevel=error

FROM node:14-alpine
LABEL Description="Kanjimi server"

ARG KANJIMI_API_URL
ARG KANJIMI_WWW_URL
ARG NODE_ENV=production
ARG KANJIMI_ALLOW_TEST_PAGES=false

USER root

COPY --chown=root:root ./src /kanjimi/src
COPY --chown=root:root ./package.json /kanjimi/package.json
COPY --chown=root:root ./package-lock.json /kanjimi/package-lock.json

COPY --chown=root:root --from=builder /kanjimi/dist/server /kanjimi/dist/server
COPY --chown=root:root --from=builder /kanjimi/www /kanjimi/www
COPY --chown=root:root --from=builder /kanjimi/node_modules /kanjimi/node_modules

WORKDIR /kanjimi

RUN adduser --disabled-password --gecos '' kanjimi

ENV NODE_ENV=${NODE_ENV}
ENV KANJIMI_ALLOW_TEST_PAGES=${KANJIMI_ALLOW_TEST_PAGES}
ENV NODE_PATH=dist/server/
ENV KANJIMI_SERVER_PORT=3000

USER kanjimi
CMD node --expose-gc dist/server/Server/server.js
HEALTHCHECK --interval=15s --timeout=3s --retries=3 --start-period=2m CMD wget -q https://localhost:3000/api/health-check/ -O /dev/null --no-check-certificate
EXPOSE 3000
