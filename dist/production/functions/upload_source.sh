#!/bin/bash

set -e

SERVER_HOSTNAME=$1

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

ssh -i ./dist/production/ssh_key root@$SERVER_HOSTNAME chmod a+rx /kanjimi
