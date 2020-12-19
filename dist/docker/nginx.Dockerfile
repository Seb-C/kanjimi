FROM nginx:1
LABEL Description="Kanjimi nginx"

COPY ./dist/nginx/nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 443
EXPOSE 80
