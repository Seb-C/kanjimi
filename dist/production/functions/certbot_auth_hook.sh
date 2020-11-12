#!/bin/sh

set -e

echo $CERTBOT_VALIDATION > /kanjimi/dist/nginx/certbot-challenges/$CERTBOT_TOKEN
