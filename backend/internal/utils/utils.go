package utils

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"railway-vless-panel/backend/internal/models"

	"github.com/skip2/go-qrcode"
)

// GenerateUUID generates a UUID v4 using crypto/rand
func GenerateUUID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return hex.EncodeToString(b[:4]) + "-" +
		hex.EncodeToString(b[4:6]) + "-" +
		hex.EncodeToString(b[6:8]) + "-" +
		hex.EncodeToString(b[8:10]) + "-" +
		hex.EncodeToString(b[10:]), nil
}

// GenerateXrayConfig generates Xray config JSON for VLESS+WS+TLS
func GenerateXrayConfig(configs []models.Config, host, port string) ([]byte, error) {
	if len(configs) == 0 {
		return []byte("{}"), nil
	}

	first := configs[0]
	path := first.Path
	if path == "" {
		path = "/"
	}
	wsHost := first.Host
	if wsHost == "" {
		wsHost = host
	}

	portNum := 443
	if first.Port > 0 {
		portNum = first.Port
	} else if port != "" {
		fmt.Sscanf(port, "%d", &portNum)
	}

	clients := make([]map[string]interface{}, 0, len(configs))
	for _, c := range configs {
		email := c.Remark
		if email == "" {
			email = c.UUID[:8]
		}
		clients = append(clients, map[string]interface{}{
			"id":    c.UUID,
			"flow":  "",
			"email": email,
			"level": 0,
		})
	}

	doc := map[string]interface{}{
		"log": map[string]interface{}{
			"loglevel": "warning",
			"access":   "/var/log/xray/access.log",
			"error":    "/var/log/xray/error.log",
		},
		"inbounds": []map[string]interface{}{
			{
				"tag":      "vless",
				"protocol": "vless",
				"listen":   "0.0.0.0",
				"port":     portNum,
				"settings": map[string]interface{}{
					"clients":    clients,
					"decryption": "none",
				},
				"streamSettings": map[string]interface{}{
					"network":  "ws",
					"security": "tls",
					"wsSettings": map[string]interface{}{
						"path": path,
						"headers": map[string]interface{}{
							"Host": wsHost,
						},
					},
					"tlsSettings": map[string]interface{}{
						"serverName": wsHost,
						"certificates": []map[string]string{
							{
								"certificateFile": "/etc/xray/fullchain.cer",
								"keyFile":         "/etc/xray/private.key",
							},
						},
					},
				},
				"sniffing": map[string]interface{}{
					"enabled":      true,
					"destOverride": []string{"http", "tls"},
				},
			},
		},
		"outbounds": []map[string]interface{}{
			{
				"protocol": "freedom",
				"tag":      "direct",
			},
			{
				"protocol": "blackhole",
				"tag":      "block",
			},
		},
		"dns": map[string]interface{}{
			"servers": []string{
				"https+local://8.8.8.8/dns-query",
				"https+local://1.1.1.1/dns-query",
				"localhost",
			},
		},
		"routing": map[string]interface{}{
			"rules": []map[string]interface{}{
				{
					"type":        "field",
					"ip":          []string{"geoip:private"},
					"outboundTag": "block",
				},
				{
					"type":        "field",
					"outboundTag": "block",
					"protocol":    []string{"bittorrent"},
				},
			},
		},
	}

	return json.MarshalIndent(doc, "", "  ")
}

// QRCode generates a QR code PNG from data
func QRCode(data string) ([]byte, error) {
	return qrcode.Encode(data, qrcode.Medium, 256)
}

// QRCodeToFile saves QR code to file
func QRCodeToFile(data, filePath string) error {
	pngBytes, err := QRCode(data)
	if err != nil {
		return err
	}
	return os.WriteFile(filePath, pngBytes, 0644)
}

// GetSystemStats reads system stats from /proc (Linux)
func GetSystemStats() (uptime float64, memUsed, memTotal uint64, cpuUsage float64) {
	if data, err := os.ReadFile("/proc/uptime"); err == nil {
		var up float64
		fmt.Sscanf(string(data), "%f", &up)
		uptime = up
	}

	if data, err := os.ReadFile("/proc/meminfo"); err == nil {
		lines := strings.Split(string(data), "\n")
		var memTotalKB, memAvailableKB int64
		for _, line := range lines {
			fields := strings.Fields(line)
			if len(fields) < 2 {
				continue
			}
			var value int64
			fmt.Sscanf(fields[1], "%d", &value)
			switch fields[0] {
			case "MemTotal:":
				memTotalKB = value
			case "MemAvailable:":
				memAvailableKB = value
			}
		}
		if memTotalKB > 0 {
			memTotal = uint64(memTotalKB) * 1024
			if memAvailableKB > 0 {
				memUsed = uint64(memTotalKB-memAvailableKB) * 1024
			}
		}
	}

	if data, err := os.ReadFile("/proc/loadavg"); err == nil {
		var load1 float64
		fmt.Sscanf(string(data), "%f", &load1)
		cpuUsage = load1
	}

	return
}

// GenerateVLESSURL generates a VLESS connection URL
func GenerateVLESSURL(cfg *models.Config, publicHost string, publicPort int) string {
	host := cfg.Host
	if host == "" {
		host = publicHost
	}

	port := cfg.Port
	if port == 0 {
		port = publicPort
	}
	if port == 0 {
		port = 443
	}

	fp := cfg.Fingerprint
	if fp == "" {
		fp = "chrome"
	}

	path := cfg.Path
	if path == "" {
		path = "/"
	}

	sni := cfg.SNI
	if sni == "" {
		sni = host
	}

	remark := cfg.Remark
	if remark == "" {
		remark = cfg.UUID
	}

	return fmt.Sprintf(
		"vless://%s@%s:%d?encryption=none&flow=&security=tls&sni=%s&fp=%s&type=ws&path=%s&host=%s#%s",
		cfg.UUID, host, port, sni, fp, path, host, remark,
	)
}

// GenerateConfigJSON generates connection JSON details
func GenerateConfigJSON(cfg *models.Config, publicHost string, publicPort int) map[string]interface{} {
	host := cfg.Host
	if host == "" {
		host = publicHost
	}

	port := cfg.Port
	if port == 0 {
		port = publicPort
	}
	if port == 0 {
		port = 443
	}

	return map[string]interface{}{
		"protocol":   "vless",
		"address":    host,
		"port":       port,
		"id":         cfg.UUID,
		"encryption": "none",
		"flow":       "",
		"security":   "tls",
		"sni":        cfg.SNI,
		"fp":         cfg.Fingerprint,
		"type":       "ws",
		"path":       cfg.Path,
		"host":       cfg.Host,
		"remark":     cfg.Remark,
	}
}