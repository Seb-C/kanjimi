#!/bin/bash

set -e

SERVER_HOSTNAME=$1

source ./dist/production/server.env

./dist/production/functions/install_dependencies.sh $SERVER_HOSTNAME
./dist/production/functions/upload_source.sh $SERVER_HOSTNAME

ssh -i ./dist/production/ssh_key root@$SERVER_HOSTNAME "
    cd /kanjimi

    INITIALIZE_CERTIFICATE=false
    if [[ -f /kanjimi/dist/nginx/production.crt && -f /kanjimi/dist/nginx/production.key ]]; then
        INITIALIZE_CERTIFICATE=true
    fi

    if [ \"\$INITIALIZE_CERTIFICATE\" = true ] ; then
        echo 'No certificate: using the self-signed one to allow the server start'
        cp -f /kanjimi/dist/server/localhost.crt /kanjimi/dist/nginx/production.crt
        cp -f /kanjimi/dist/server/localhost.key /kanjimi/dist/nginx/production.key
    fi

    if [[ \"\$(docker ps -a --filter name=server -q | wc -l)\" == \"0\" ]]; then
        echo 'Server not created yet. Creating it.'
        docker create \
            -v /kanjimi:/kanjimi:ro \
            -v /kanjimi/dist/nginx/nginx.conf:/etc/nginx/templates/nginx.conf.template:ro \
            --name nginx \
            --env-file /kanjimi/dist/production/server.env \
            --restart always \
            --publish 443:3000 \
            --log-driver journald \
            nginx:1
    fi

    if [[ \"\$(docker ps --filter name=server -q | wc -l)\" == \"0\" ]]; then
        echo 'Server not started yet. Starting it.'
        docker start nginx
    fi

    if [ \"\$INITIALIZE_CERTIFICATE\" = true ] ; then
        echo 'Creating the proper certificate'
        docker run \
            -v /kanjimi:/kanjimi \
            -w /kanjimi \
            -it \
            --rm certbot/certbot:v1.8.0 \
            certonly \
            --manual \
            --preferred-challenges=http \
            -m contact@kanjimi.com \
            --agree-tos \
            --no-eff-email \
            --manual-public-ip-logging-ok \
            --manual-auth-hook /kanjimi/dist/production/functions/certbot_auth_hook.sh \
            --manual-cleanup-hook /kanjimi/dist/production/functions/certbot_cleanup_hook.sh \
            --fullchain-path /kanjimi/dist/nginx/production.crt \
            --key-path /kanjimi/dist/nginx/production.key \
            -d kanjimi.com
    fi

    echo 'Clearing nginx cache'
    docker exec nginx rm -Rf '/var/cache/nginx/*'

    echo 'Reloading nginx configuration'
    docker exec nginx nginx -s reload
"
