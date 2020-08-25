#!/bin/bash

set -e

SERVER_HOSTNAME=$1

source ./dist/production/server.env

# Installing dependencies on the server if necessary
ssh -i ./dist/production/ssh_key root@$SERVER_HOSTNAME apt-get install -y \
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
    --exclude .firefox-profile \
    --exclude .git \
    --exclude .github \
    --exclude cypress \
    --exclude Dictionary \
    --exclude node_modules \
    --exclude dist/production/ssh_key \
    --exclude dist/production/ssh_key.pub \
    -rv \
    -e 'ssh -i /kanjimi/dist/production/ssh_key' \
    ./ \
    root@$SERVER_HOSTNAME:/kanjimi

ssh -i ./dist/production/ssh_key root@$SERVER_HOSTNAME "
    cd /kanjimi

    docker build \
        -t server \
        --build-arg SERVER_HOSTNAME=$SERVER_HOSTNAME \
        --build-arg KANJIMI_API_URL=$KANJIMI_API_URL \
        --build-arg KANJIMI_WWW_URL=$KANJIMI_WWW_URL \
        -f /kanjimi/dist/production/Dockerfile \
        .

    if [[ \"\$(docker ps --filter name=server -q | wc -l)\" == \"1\" ]]; then
        echo 'Stopping the server'
        docker stop server --time 30
    else
        echo 'Server not already running'
    fi

    if [[ \"\$(docker ps -a --filter name=server -q | wc -l)\" == \"1\" ]]; then
        echo 'Deleting the container'
        docker rm server
    else
        echo 'Server container does not already exists'
    fi

    echo 'Creating the container'
    docker create \
        --name server \
        --env-file /kanjimi/dist/production/server.env \
        --restart always \
        --publish 443:3000 \
        --log-driver journald \
        server

    echo 'Starting the container'
    docker start server

    echo 'Waiting for the server to be ready'
    until [[ \"\$(docker ps --filter health=starting -q | wc -l)\" == \"0\" ]]; do
        sleep 1
    done

    echo 'Failing if not healthy'
    if [[ \"\$(docker ps --filter health=unhealthy -q | wc -l)\" -gt \"0\" ]]; then
        echo 'Container not healthy. Aborting'
        exit 1
    done
"

echo "Waiting one minute for the load balancer checks"
sleep 60
