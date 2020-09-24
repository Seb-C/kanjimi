#!/bin/bash

set -e

SERVER_HOSTNAME=$1

source ./dist/production/server.env

./dist/production/functions/install_dependencies.sh $SERVER_HOSTNAME
./dist/production/functions/upload_source.sh $SERVER_HOSTNAME

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
    fi
"

echo "Waiting for the load balancer checks"
sleep 10
