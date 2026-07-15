FROM alpine:latest

RUN apk add --no-cache ca-certificates curl unzip nginx su-exec

RUN adduser -D -u 1001 xray && \
    mkdir -p /www /etc/xray \
             /var/log/nginx \
             /var/cache/nginx \
             /var/lib/nginx/tmp \
             /var/lib/nginx/logs \
             /var/run/nginx \
             /tmp/nginx && \
    chown -R xray:xray /www /etc/xray /var/log/nginx /var/cache/nginx \
                       /var/lib/nginx /var/run/nginx /tmp/nginx /tmp

RUN mkdir /tmp/xray && \
    curl -L -o /tmp/xray/xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip && \
    unzip /tmp/xray/xray.zip -d /tmp/xray && \
    mv /tmp/xray/xray /usr/local/bin/ai-core && \
    chmod +x /usr/local/bin/ai-core && \
    rm -rf /tmp/xray

COPY index.html /www/index.html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER xray
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:7860 || exit 1
ENTRYPOINT ["/entrypoint.sh"]