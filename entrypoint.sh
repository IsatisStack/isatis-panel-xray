#!/bin/sh
set -e

if [ -z "$UUID" ]; then
  echo "❌ UUID را در Variables تعریف کنید!"
  exit 1
fi

WSPATH=${WSPATH:-/api/v1/aichatbot}

cat > /etc/xray/config.json << EOF
{
  "log": {"loglevel": "warning"},
  "inbounds": [{
    "port": 9000,
    "listen": "127.0.0.1",
    "protocol": "vless",
    "settings": {
      "clients": [{"id": "${UUID}"}],   # flow رو حذف کن
      "decryption": "none"
    },
    "streamSettings": {
      "network": "ws",
      "wsSettings": {"path": "${WSPATH}"}
    }
  }],
  "outbounds": [{"protocol": "freedom"}]
}
EOF

echo "✅ دمو AI راه‌اندازی شد | Path: ${WSPATH}"

cat > /tmp/nginx.conf << EOF
pid /tmp/nginx.pid;

events { worker_connections 1024; }

http {
    client_body_temp_path /tmp/nginx/client_body 1 2;
    proxy_temp_path       /tmp/nginx/proxy;
    fastcgi_temp_path     /tmp/nginx/fastcgi;
    uwsgi_temp_path       /tmp/nginx/uwsgi;
    scgi_temp_path        /tmp/nginx/scgi;

    server {
        listen 7860 default_server;
        server_name _;

        access_log /var/log/nginx/access.log;
        error_log  /var/log/nginx/error.log warn;

        location / {
            root /www;
            index index.html;
            try_files \$uri \$uri/ =404;
        }

        location ${WSPATH} {
            proxy_pass http://127.0.0.1:9000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header Origin "https://chat.openai.com";  # برای obfuscation اضافی
            proxy_read_timeout 86400;
        }
    }
}
EOF

echo "nginx.conf ساخته شد با WSPATH: ${WSPATH}"
grep "location" /tmp/nginx.conf

ai-core run -config /etc/xray/config.json &

exec nginx -c /tmp/nginx.conf -g "daemon off;"