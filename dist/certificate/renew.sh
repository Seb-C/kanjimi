docker run \
    -v $PWD/dist/letsencrypt:/etc/letsencrypt \
    -v $PWD:/kanjimi \
    -it \
    --rm certbot/dns-digitalocean:v1.10.0 \
    certonly \
    --preferred-challenges=dns \
    --dns-digitalocean \
    --dns-digitalocean-credentials /kanjimi/dist/certificate/config.ini \
    --dns-digitalocean-propagation-seconds=30 \
    -m contact@kanjimi.com \
    --agree-tos \
    --no-eff-email \
    --manual-public-ip-logging-ok \
    --force-renewal \
    -d kanjimi.com \
    -d www.kanjimi.com
