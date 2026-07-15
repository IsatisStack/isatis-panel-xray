package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/skip2/go-qrcode"

	"railway-vless-panel/backend/internal/config"
	"railway-vless-panel/backend/internal/db"
	"railway-vless-panel/backend/internal/models"
)

// XrayService handles Xray-core operations
type XrayService struct {
	xrayPath   string
	configPath string
	db         *db.DB
	cfg        *config.Config
	process    *os.Process
	running    bool
	startTime  time.Time
}

// NewXrayService creates a new XrayService
func NewXrayService(cfg *config.Config, database *db.DB) *XrayService {
	return &XrayService{
		xrayPath:   cfg.XrayPath,
		configPath: cfg.XrayConfigPath,
		db:         database,
		cfg:        cfg,
	}
}

// Start starts the Xray process
func (s *XrayService) Start() error {
	if _, err := os.Stat(s.xrayPath); os.IsNotExist(err) {
		return fmt.Errorf("xray binary not found at %s", s.xrayPath)
	}

	// Ensure config exists
	if _, err := os.Stat(s.configPath); os.IsNotExist(err) {
		if err := s.writeInitialConfig(); err != nil {
			return fmt.Errorf("failed to write initial config: %w", err)
		}
	}

	cmd := exec.Command(s.xrayPath, "run", "-c", s.configPath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start xray: %w", err)
	}

	s.process = cmd.Process
	s.running = true
	s.startTime = time.Now()

	log.Printf("Xray started with PID %d", s.process.Pid)

	go func() {
		if err := cmd.Wait(); err != nil {
			log.Printf("Xray process exited: %v", err)
		}
		s.running = false
	}()

	return nil
}

// Stop stops the Xray process
func (s *XrayService) Stop() error {
	if s.process == nil {
		return nil
	}

	if err := s.process.Signal(syscall.SIGTERM); err != nil {
		if err := s.process.Kill(); err != nil {
			return fmt.Errorf("failed to kill xray: %w", err)
		}
	}

	s.running = false
	s.process = nil
	return nil
}

// Reload sends SIGHUP to Xray for hot reload
func (s *XrayService) Reload() error {
	if s.process == nil {
		return fmt.Errorf("xray not running")
	}

	if err := s.process.Signal(syscall.SIGHUP); err != nil {
		// Fallback: try API reload
		cmd := exec.Command(s.xrayPath, "api", "reload", "--all")
		if output, err := cmd.CombinedOutput(); err != nil {
			log.Printf("Xray reload failed, restarting: %v\n%s", err, string(output))
			if err := s.Stop(); err != nil {
				return err
			}
			return s.Start()
		}
	}

	log.Println("Xray configuration reloaded successfully")
	return nil
}

// RegenerateConfig regenerates Xray config from database and reloads
func (s *XrayService) RegenerateConfig() error {
	configs, err := s.db.ConfigRepository.GetAll()
	if err != nil {
		return fmt.Errorf("failed to get configs: %w", err)
	}

	// Convert []*Config to []Config for GenerateXrayConfig
	var configSlice []models.Config
	for _, c := range configs {
		configSlice = append(configSlice, *c)
	}

	configData := GenerateXrayConfig(configSlice, s.cfg.Railway.PublicDomain, s.cfg.Railway.Port)

	if err := os.WriteFile(s.configPath, configData, 0644); err != nil {
		return fmt.Errorf("failed to write xray config: %w", err)
	}

	log.Println("Xray configuration regenerated and written")

	return s.Reload()
}

// writeInitialConfig writes an empty xray config
func (s *XrayService) writeInitialConfig() error {
	port := s.cfg.Railway.GetRailwayPortAsInt()
	config := map[string]interface{}{
		"log": map[string]interface{}{
			"loglevel": "warning",
			"access":   "/var/log/xray/access.log",
			"error":    "/var/log/xray/error.log",
		},
		"inbounds": []map[string]interface{}{
			{
				"tag":      "vless-ws",
				"listen":   "0.0.0.0",
				"port":     port,
				"protocol": "vless",
				"settings": map[string]interface{}{
					"clients":    []interface{}{},
					"decryption": "none",
				},
				"streamSettings": map[string]interface{}{
					"network": "ws",
					"wsSettings": map[string]interface{}{
						"path":    "/ws",
						"headers": map[string]interface{}{},
					},
				},
				"sniffing": map[string]interface{}{
					"enabled":      true,
					"destOverride": []string{"http", "tls"},
				},
			},
		},
		"outbounds": []map[string]interface{}{
			{"protocol": "freedom", "tag": "direct"},
		},
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.configPath, data, 0644)
}

// GetVersion returns the Xray version
func (s *XrayService) GetVersion() (string, error) {
	cmd := exec.Command(s.xrayPath, "version")
	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get xray version: %w", err)
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "Xray-core") || strings.HasPrefix(line, "Xray") {
			parts := strings.Fields(line)
			if len(parts) >= 2 {
				return parts[1], nil
			}
		}
	}

	return strings.TrimSpace(string(output)), nil
}

// GetPID returns the process PID
func (s *XrayService) GetPID() int {
	if s.process != nil {
		return s.process.Pid
	}
	return 0
}

// GetDomain returns Railway domain
func (s *XrayService) GetDomain() string {
	if s.cfg != nil {
		return s.cfg.Railway.PublicDomain
	}
	return "localhost"
}

// GetPort returns Railway port
func (s *XrayService) GetPort() string {
	if s.cfg != nil && s.cfg.Railway.Port != "" {
		return s.cfg.Railway.Port
	}
	return "443"
}

// IsRunning returns true if Xray process is running
func (s *XrayService) IsRunning() bool {
	if !s.running || s.process == nil {
		return false
	}

	if err := s.process.Signal(syscall.Signal(0)); err != nil {
		s.running = false
		return false
	}

	return true
}

// GetUptime returns human-readable uptime since last start
func (s *XrayService) GetUptime() string {
	if !s.IsRunning() {
		return "N/A"
	}

	uptime := time.Since(s.startTime)
	days := int(uptime.Hours()) / 24
	hours := int(uptime.Hours()) % 24
	mins := int(uptime.Minutes()) % 60

	if days > 0 {
		return fmt.Sprintf("%dd %dh %dm", days, hours, mins)
	}
	if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, mins)
	}
	return fmt.Sprintf("%dm", mins)
}

// GenerateXrayConfig generates the Xray config JSON
func GenerateXrayConfig(configs []models.Config, host string, port string) []byte {
	var clients []map[string]interface{}

	for _, c := range configs {
		client := map[string]interface{}{
			"id":         c.UUID,
			"flow":       "",
			"decryption": "none",
		}
		clients = append(clients, client)
	}

	wsPath := "/ws"
	if len(configs) > 0 {
		wsPath = configs[0].Path
	}

	wsHost := host
	if len(configs) > 0 && configs[0].Host != "" {
		wsHost = configs[0].Host
	}

	portNum := 443
	fmt.Sscanf(port, "%d", &portNum)

	config := map[string]interface{}{
		"log": map[string]interface{}{
			"loglevel": "warning",
			"access":   "/var/log/xray/access.log",
			"error":    "/var/log/xray/error.log",
		},
		"inbounds": []map[string]interface{}{
			{
				"tag":      "vless-ws",
				"listen":   "0.0.0.0",
				"port":     portNum,
				"protocol": "vless",
				"settings": map[string]interface{}{
					"clients":    clients,
					"decryption": "none",
				},
				"streamSettings": map[string]interface{}{
					"network": "ws",
					"wsSettings": map[string]interface{}{
						"path": wsPath,
						"headers": map[string]interface{}{
							"Host": wsHost,
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
			{"protocol": "freedom", "tag": "direct"},
			{"protocol": "blackhole", "tag": "block"},
		},
	}

	data, _ := json.MarshalIndent(config, "", "  ")
	return data
}

// GenerateVlessURL generates a VLESS URL from config
func GenerateVlessURL(c models.Config, host string, port string) string {
	remark := c.Remark
	if remark == "" {
		remark = "VLESS"
	}

	return fmt.Sprintf("vless://%s@%s:%s?encryption=none&flow=&security=tls&sni=%s&fp=%s&type=ws&path=%s&host=%s#%s",
		c.UUID,
		host,
		port,
		c.SNI,
		c.Fingerprint,
		c.Path,
		c.Host,
		remark,
	)
}

// GenerateVlessJSON generates a client config JSON
func GenerateVlessJSON(c models.Config, host string, port string) map[string]interface{} {
	portNum := 443
	fmt.Sscanf(port, "%d", &portNum)

	return map[string]interface{}{
		"v":     "2",
		"ps":    c.Remark,
		"add":   host,
		"port":  portNum,
		"id":    c.UUID,
		"aid":   0,
		"scy":   "none",
		"net":   "ws",
		"type":  "none",
		"host":  c.Host,
		"path":  c.Path,
		"tls":   "tls",
		"sni":   c.SNI,
		"fp":    c.Fingerprint,
		"alpn":  "h2,http/1.1",
	}
}

// GenerateQR generates a QR code PNG bytes for VLESS URL
func GenerateQR(c models.Config, host string, port string) ([]byte, error) {
	url := GenerateVlessURL(c, host, port)

	qr, err := qrcode.New(url, qrcode.Medium)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code: %w", err)
	}

	var buf bytes.Buffer
	if err := qr.Write(256, &buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}