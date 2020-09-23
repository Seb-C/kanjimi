#!/bin/bash

set -e

SERVER_HOSTNAME=$1

ssh -i ./dist/production/ssh_key root@$SERVER_HOSTNAME apt-get install -y \
    rsync \
    docker.io \
    unattended-upgrades
