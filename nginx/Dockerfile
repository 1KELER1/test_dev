FROM nginx:1.23.0-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.dev.conf /etc/nginx/conf.d/default.conf

COPY ./manager.sh /manager.sh

USER root

RUN apk add --no-cache openssl bash
RUN chmod +x /manager.sh

CMD ["nginx", "-g", "daemon off;"]