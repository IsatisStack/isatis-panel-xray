#!/bin/sh
set -e

# Railway VLESS Panel - Start Script
echo "========================================="
echo "  Railway VLESS Panel v1.0"
echo "========================================="

# Set default port if not provided
if [ -z "$PORT" ]; then
    PORT=8080
fi

echo "[INFO] Server port: $PORT"

# Create necessary directories
mkdir -p /app/data/logs
mkdir -p /app/data

# Generate initial xray config if empty
CONFIG_FILE="/etc/xray/config.json"
if [ ! -f "$CONFIG_FILE" ] || [ ! -s "$CONFIG_FILE" ]; then
    echo "[INFO] Generating initial Xray configuration..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/xray/access.log",
    "error": "/var/log/xray/error.log"
  },
  "inbounds": [
    {
      "tag": "vless-ws",
      "listen": "0.0.0.0",
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "ws",
        "security": "none",
        "wsSettings": {
          "path": "/ws",
          "headers": {}
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ]
}
EOF
    echo "[INFO] Initial Xray config created."
fi

# Start Xray in background
echo "[INFO] Starting Xray..."
/usr/local/bin/xray run -c /etc/xray/config.json &
XRAY_PID=$!
echo "[INFO] Xray started with PID: $XRAY_PID"

# Wait for Xray to start
sleep 1

# Check if Xray is running
if kill -0 $XRAY_PID 2>/dev/null; then
    echo "[INFO] Xray is running successfully."
else
    echo "[WARN] Xray failed to start. Will retry on first config creation."
fi

# Start the Go backend
echo "[INFO] Starting backend server..."
exec /app/server