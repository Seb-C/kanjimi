#!/bin/bash

set -e

if [ ! -f ./production/kanjimi-server.env ]; then
    echo 'Missing kanjimi-server.env file'
    exit 1
fi

if [ ! -f ./production/ssh_key ]; then
    echo 'Missing ssh_key file'
    exit 1
fi

./production/setup_server.sh s1.kanjimi.com
