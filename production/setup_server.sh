#!/bin/bash

set -e

SERVER=$1

# Installing rsync on the server if necessary
ssh -i ./production/ssh_key root@$SERVER apt-get install -y rsync

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
    root@$SERVER:/kanjimi

ssh -i ./ssh_key root@$SERVER /bin/bash << EOF
    cd /kanjimi

    apt-get install -y unattended-upgrades

    mkdir -p ./kanjimi-server-certificate
    openssl req -nodes \
        -newkey rsa:2048 \
        -keyout ./kanjimi-server-certificate/kanjimi.key \
        -out ./kanjimi-server-certificate/kanjimi.crt \
        -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$SERVER"

    docker build -t kanjimi-server -f ./production/Dockerfile .

    docker run \
        --env-file ./kanjimi-server.env \
        --init \
        --interactive \
        --rm \
        kanjimi-server \
        node server/Server/migrate.js

    docker stop kanjimi-server --time 30
    docker rm kanjimi-server
    docker create \
        --name kanjimi-server \
        --env-file ./kanjimi-server.env \
        --restart always \
        --publish 443:3000 \
        --log-driver journald \
        --volume ./kanjimi-server-certificate:./kanjimi-server-certificate:ro \
        kanjimi-server
    docker start kanjimi-server

    until [[ "$(docker ps --filter health=starting -q | wc -l)" == "0" ]]; do
        sleep 1
    done
EOF
