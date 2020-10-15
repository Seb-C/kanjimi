#!/bin/bash

set -e

SERVER_HOSTNAME=$1

source ./dist/production/server.env

./dist/production/functions/install_dependencies.sh $SERVER_HOSTNAME
./dist/production/functions/upload_source.sh $SERVER_HOSTNAME

ssh -i ./dist/production/ssh_key root@$SERVER_HOSTNAME "
    cd /kanjimi

    INITIALIZE_CERTIFICATE=\"0\"
    if [[ ! -f /etc/letsencrypt/live/kanjimi.com/fullchain.pem || ! -f /etc/letsencrypt/live/kanjimi.com/privkey.pem ]]; then
        INITIALIZE_CERTIFICATE=\"1\"
    fi

    if [[ \"\$INITIALIZE_CERTIFICATE\" == \"1\" ]] ; then
        echo 'No certificate: using the self-signed one to allow the server start'
        mkdir -p /etc/letsencrypt/live/kanjimi.com
        cp -f /kanjimi/dist/server/localhost.crt /etc/letsencrypt/live/kanjimi.com/fullchain.pem
        cp -f /kanjimi/dist/server/localhost.key /etc/letsencrypt/live/kanjimi.com/privkey.pem
    fi

    if [[ \"\$(docker ps -a --filter name=nginx -q | wc -l)\" == \"0\" ]]; then
        echo 'Server not created yet. Creating it.'
        docker create \
            -v /kanjimi:/kanjimi \
            -v /etc/letsencrypt:/etc/letsencrypt \
            -v /kanjimi/dist/nginx/nginx.conf:/etc/nginx/templates/default.conf.template \
            --name nginx \
            --env-file /kanjimi/dist/production/server.env \
            --restart always \
            --publish 80:80 \
            --publish 443:3000 \
            --log-driver journald \
            --log-opt tag=nginx \
            nginx:1
    fi

    if [[ \"\$(docker ps --filter name=nginx -q | wc -l)\" == \"0\" ]]; then
        echo 'Server not started yet. Starting it.'
        docker start nginx
    fi

    echo 'Waiting for the server to be ready'
    until [[ \"\$(docker ps --filter health=starting -q | wc -l)\" == \"0\" ]]; do
        sleep 1
    done

    if [[ \"\$INITIALIZE_CERTIFICATE\" = \"1\" ]] ; then
        echo 'Removing the temp certificate and creating the proper one'
        rm /etc/letsencrypt/live/kanjimi.com/fullchain.pem
        rm /etc/letsencrypt/live/kanjimi.com/privkey.pem
        docker run \
            -v /kanjimi:/kanjimi \
            -v /etc/letsencrypt:/etc/letsencrypt \
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
            -d kanjimi.com \
            -d www.kanjimi.com
    fi

    echo 'Clearing nginx cache'
    docker exec -t nginx bash -c 'rm -Rf /var/cache/nginx/*'
    docker restart nginx

    echo 'Rebuilding and reloading nginx configuration'
    docker exec nginx bash -c \"source /kanjimi/dist/production/server.env && exec 3>&1 && /docker-entrypoint.d/20-envsubst-on-templates.sh\"
    docker exec -t nginx nginx -s reload
"
