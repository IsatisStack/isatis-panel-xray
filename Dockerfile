FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip ca-certificates gettext-base jq \
    && rm -rf /var/lib/apt/lists/*

# دانلود آخرین نسخه Xray-core از GitHub Releases (به صورت داینامیک)
RUN XRAY_VERSION=$(curl -s https://api.github.com/repos/XTLS/Xray-core/releases/latest | jq -r .tag_name) \
    && curl -L -o /tmp/xray.zip \
       "https://github.com/XTLS/Xray-core/releases/download/${XRAY_VERSION}/Xray-linux-64.zip" \
    && unzip /tmp/xray.zip -d /usr/local/bin \
    && rm /tmp/xray.zip \
    && chmod +x /usr/local/bin/xray

WORKDIR /app
COPY config.template.json .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]