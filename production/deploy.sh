#!/bin/bash

set -e

if [ ! -f ./kanjimi-server.env ]; then
    echo 'Missing kanjimi-server.env file'
    exit 1
fi

docker build -t kanjimi-server -f ./production/Dockerfile .
docker save -o ./kanjimi-server.tar kanjimi-server

./setup_server.sh example.com
