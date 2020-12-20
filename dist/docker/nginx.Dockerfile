FROM nginx:1-alpine
LABEL Description="Kanjimi nginx"

COPY ./dist/nginx/nginx.conf /etc/nginx/templates/default.conf.template

RUN mkdir -p /etc/ssl/certs \
    && apk add --no-cache openssl \
    && openssl req \
        -x509 \
        -nodes \
        -newkey rsa:2048 \
        -keyout /etc/ssl/certs/kanjimi.key \
        -out /etc/ssl/certs/kanjimi.crt \
        -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Kanjimi/OU=Kanjimi/CN=$KANJIMI_NGINX_DOMAIN" \
    && chmod a+r-w -R /etc/ssl/certs/kanjimi.* \
    && apk del --no-cache openssl

ENV KANJIMI_NGINX_CERTIFICATE_KEY=/etc/ssl/certs/kanjimi.key
ENV KANJIMI_NGINX_CERTIFICATE_CRT=/etc/ssl/certs/kanjimi.crt

EXPOSE 443
EXPOSE 80
