package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds application configuration
type Config struct {
	Host           string
	Port           string
	DatabasePath   string
	XrayPath       string
	XrayConfigPath string
	LogDir         string
	FrontendPath   string
	CORSOrigins    []string
	Ready          bool
	Railway        RailwayConfig
}

// RailwayConfig holds Railway-specific configuration
type RailwayConfig struct {
	PublicDomain string
	ProjectName  string
	ServiceName  string
	Port         string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		Host:           getEnv("HOST", "0.0.0.0"),
		Port:           getEnv("PORT", "8080"),
		DatabasePath:   getEnv("DB_PATH", "./data/panel.db"),
		XrayPath:       getEnv("XRAY_PATH", "/usr/local/bin/xray"),
		XrayConfigPath: getEnv("XRAY_CONFIG_PATH", "/etc/xray/config.json"),
		LogDir:         getEnv("LOG_DIR", "./data/logs"),
		FrontendPath:   getEnv("FRONTEND_PATH", "./frontend/dist"),
		CORSOrigins:    strings.Split(getEnv("CORS_ORIGINS", "*"), ","),
		Ready:          false,
		Railway: RailwayConfig{
			PublicDomain: getEnv("RAILWAY_PUBLIC_DOMAIN", ""),
			ProjectName:  getEnv("RAILWAY_PROJECT_NAME", ""),
			ServiceName:  getEnv("RAILWAY_SERVICE_NAME", ""),
			Port:         getEnv("PORT", "8080"),
		},
	}

	// Create required directories
	for _, dir := range []string{
		cfg.DatabasePath[:strings.LastIndex(cfg.DatabasePath, "/")],
		cfg.LogDir,
	} {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	return cfg, nil
}

// GetDomain returns Railway public domain
func (c *Config) GetDomain() string {
	return c.Railway.PublicDomain
}

// GetPort returns Railway-handled port
func (c *Config) GetPort() string {
	if c.Railway.Port != "" {
		return c.Railway.Port
	}
	return "8080"
}

// GetRailwayPortAsInt returns the Railway port as integer
func (r *RailwayConfig) GetRailwayPortAsInt() int {
	port := 443
	if r.Port != "" {
		if p, err := strconv.Atoi(r.Port); err == nil {
			port = p
		}
	}
	return port
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// Global config instance
var globalConfig *Config

// Get returns the global config instance
func Get() *Config {
	return globalConfig
}

// Set sets the global config instance
func Set(cfg *Config) {
	globalConfig = cfg
}

// SetReady marks the config as ready
func (c *Config) SetReady(ready bool) {
	c.Ready = ready
}