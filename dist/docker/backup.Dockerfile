FROM postgres:12-alpine

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
RUN apk update
RUN apk search --no-cache s3cmd
RUN apk add -u s3cmd
