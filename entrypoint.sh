#!/usr/bin/env bash
set -e

# ---- بررسی متغیرهای اجباری ----
: "${UUID:?خطا: متغیر UUID را در Railway Variables تنظیم کنید}"

# ---- مقادیر پیش‌فرض (اگر کاربر ست نکرده باشد) ----
: "${WS_PATH:=/}"
: "${TRANSPORT:=ws}"
: "${HOST:=}"
: "${PORT:=8080}"          # Railway خودش این را تزریق می‌کند
: "${ADDRESS:=}"           # دامنه public پروژه در Railway
: "${CLIENT_PORT:=443}"    # پورتی که کلاینت‌ها استفاده می‌کنند
: "${TLS:=tls}"
: "${SNI:=$ADDRESS}"
: "${FINGERPRINT:=chrome}"
: "${ALPN:=h2,http/1.1}"

export PORT UUID WS_PATH TRANSPORT HOST

# ---- ساخت config.json نهایی از روی template ----
envsubst '$PORT $UUID $WS_PATH $TRANSPORT $HOST' \
  < config.template.json > config.json

# ---- تابع URL-encode با jq ----
urlencode() {
  jq -rn --arg v "$1" '$v|@uri'
}

echo "==================================================="
echo " سرویس VLESS در حال اجراست (پورت داخلی: $PORT)"

if [ -n "$ADDRESS" ]; then
  ENC_PATH=$(urlencode "$WS_PATH")
  ENC_ALPN=$(urlencode "$ALPN")
  ENC_HOST=$(urlencode "${HOST:-$ADDRESS}")
  ENC_SNI=$(urlencode "$SNI")

  LINK="vless://${UUID}@${ADDRESS}:${CLIENT_PORT}?encryption=none&security=${TLS}&sni=${ENC_SNI}&fp=${FINGERPRINT}&alpn=${ENC_ALPN}&type=${TRANSPORT}&host=${ENC_HOST}&path=${ENC_PATH}#Railway-VLESS"

  echo " لینک اتصال کلاینت:"
  echo ""
  echo "$LINK"
else
  echo " متغیر ADDRESS تنظیم نشده — لینک ساخته نشد."
  echo " باید دستی در کلاینت خود این مقادیر را وارد کنید:"
  echo " UUID=$UUID | PATH=$WS_PATH | PORT=443 | TLS=on"
fi
echo "==================================================="

exec xray run -config config.json