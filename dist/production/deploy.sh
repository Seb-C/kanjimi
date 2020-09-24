#!/bin/bash

set -e

if [ ! -f ./dist/production/server.env ]; then
    echo 'Missing server.env file'
    exit 1
fi

if [ ! -f ./dist/production/ssh_key ]; then
    echo 'Missing ssh_key file'
    exit 1
fi

./dist/production/deploy_server.sh 167.71.146.98

# Doing nginx at the end so we can clear the cache
./dist/production/deploy_nginx.sh 178.128.180.114
