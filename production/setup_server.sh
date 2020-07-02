#!/bin/bash

set -e

SERVER_HOSTNAME=$1

# Installing dependencies on the server if necessary
ssh -i ./production/ssh_key root@$SERVER_HOSTNAME apt-get install -y \
    rsync \
    docker.io \
    unattended-upgrades

# Uploading files
docker run -v ${PWD}:/kanjimi -v ~/.ssh/known_hosts:/root/.ssh/known_hosts -w /kanjimi -it --rm instrumentisto/rsync-ssh \
    rsync \
    --checksum \
    --delete \
    --progress \
    --info=progress2 \
    --exclude .git \
    --exclude .github \
    --exclude cypress \
    --exclude Dictionary \
    --exclude firefox-profile \
    --exclude node_modules \
    --exclude production/ssh_key \
    --exclude production/ssh_key.pub \
    -rv \
    -e 'ssh -i /kanjimi/production/ssh_key' \
    ./ \
    root@$SERVER_HOSTNAME:/kanjimi

ssh -i ./production/ssh_key root@$SERVER_HOSTNAME /bin/bash << EOF
    cd /kanjimi

    docker build \
        -t server \
        --build-arg SERVER_HOSTNAME=$SERVER_HOSTNAME \
        -f /kanjimi/production/Dockerfile \
        .

    docker run \
        --name migrate \
        --env-file /kanjimi/production/server.env \
        --init \
        --interactive \
        --rm \
        server \
        node server/Server/migrate.js

    if [[ "$(docker ps --filter name=server -q | wc -l)" == "1" ]]; then
        docker stop server --time 30
    else
        echo "Server not already running"
    fi

    if [[ "$(docker ps -a --filter name=server -q | wc -l)" == "1" ]]; then
        docker rm server
    else
        echo "Server container does not already exists"
    fi

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
