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
    --force-renewal \
    -d kanjimi.com \
    -d www.kanjimi.com \
    || true

sudo chmod -R a+X ./dist/letsencrypt
sudo chmod -R a+r ./dist/letsencrypt
