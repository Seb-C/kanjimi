#!/bin/bash

set -e

SERVER_HOSTNAME=$1

# Installing dependencies on the server if necessary
ssh -i ./production/ssh_key root@$SERVER_HOSTNAME apt-get install -y \
    rsync \
    docker.io \
    unattended-upgrades

# Uploading files
docker run -v ${PWD}:/app -v ~/.ssh/known_hosts:/root/.ssh/known_hosts -w /app -it --rm instrumentisto/rsync-ssh \
    rsync \
    --delete \
    --progress \
    --info=progress2 \
    --exclude .git \
    --exclude .github \
    --exclude Dictionary \
    --exclude firefox-profile \
    --exclude node_modules \
    --exclude production/ssh_key \
    --exclude production/ssh_key.pub \
    -urv \
    -e 'ssh -i /app/production/ssh_key' \
    ./ \
    root@$SERVER_HOSTNAME:/kanjimi

ssh -i ./production/ssh_key root@$SERVER_HOSTNAME /bin/bash << EOF
    cd /kanjimi

    docker build \
        -t server \
        -f /kanjimi/production/Dockerfile \
        --build-arg SERVER_HOSTNAME=$SERVER_HOSTNAME \
        .

    docker run \
        --env-file /kanjimi/production/server.env \
        --init \
        --interactive \
        --rm \
        server \
        node server/Server/migrate.js

    docker stop server --time 30
    docker rm server
    docker create \
        --name server \
        --env-file /kanjimi/production/server.env \
        --restart always \
        --publish 443:3000 \
        --log-driver journald \
        server
    docker start server

    until [[ "$(docker ps --filter health=starting -q | wc -l)" == "0" ]]; do
        sleep 1
    done
EOF
