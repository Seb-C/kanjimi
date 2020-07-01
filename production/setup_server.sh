#!/bin/bash

set -e

SERVER=$1

scp ./kanjimi-server.tar $SERVER:~/kanjimi-server.tar
scp ./kanjimi-server.env $SERVER:~/kanjimi-server.env

ssh $SERVER /bin/bash << EOF
    apt-get install unattended-upgrades

    mkdir -p ~/kanjimi-server-certificate
    openssl req -nodes \
        -newkey rsa:2048 \
        -keyout ~/kanjimi-server-certificate/kanjimi.key \
        -out ./kanjimi-server-certificate/kanjimi.crt \
        -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$(hostname)"

    docker load -i ~/kanjimi-server.tar

    docker run \
        --env-file ~/kanjimi-server.env \
        --init \
        --interactive \
        --rm \
        kanjimi-server \
        node server/Server/migrate.js

    docker stop kanjimi-server --time 30
    docker rm kanjimi-server
    docker create \
        --name kanjimi-server \
        --env-file ~/kanjimi-server.env \
        --restart always \
        --publish 443:3000 \
        --log-driver journald \
        --volume ~/kanjimi-server-certificate:~/kanjimi-server-certificate:ro \
        kanjimi-server
    docker start kanjimi-server

    until [[ "$(docker ps --filter health=starting -q | wc -l)" == "0" ]]; do
        sleep 1
    done
EOF
