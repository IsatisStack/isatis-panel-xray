package models

import (
	"time"

	"gorm.io/gorm"
)

// Config represents a VLESS configuration
type Config struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UUID        string         `json:"uuid" gorm:"uniqueIndex;not null;size:36"`
	Remark      string         `json:"remark" gorm:"size:100"`
	Fingerprint string         `json:"fingerprint" gorm:"size:20;default:'chrome'"`
	HTTPVersion string         `json:"http_version" gorm:"size:10;default:'auto'"`
	Path        string         `json:"path" gorm:"size:100;default:'/ws'"`
	Host        string         `json:"host" gorm:"size:255"`
	SNI         string         `json:"sni" gorm:"size:255"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// Setting represents a key-value setting
type Setting struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Key       string    `json:"key" gorm:"uniqueIndex;not null;size:100"`
	Value     string    `json:"value" gorm:"size:500"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName returns the table name for Config
func (Config) TableName() string {
	return "configs"
}

// TableName returns the table name for Setting
func (Setting) TableName() string {
	return "settings"
}

// CreateConfigRequest represents the request to create a config
type CreateConfigRequest struct {
	Remark      string `json:"remark" binding:"max=100"`
	Fingerprint string `json:"fingerprint" binding:"oneof=chrome firefox safari edge android ios random"`
	HTTPVersion string `json:"http_version" binding:"oneof=auto 1.1 2 3"`
	Path        string `json:"path" binding:"max=100"`
	Host        string `json:"host" binding:"max=255"`
	SNI         string `json:"sni" binding:"max=255"`
}

// UpdateConfigRequest represents the request to update a config
type UpdateConfigRequest struct {
	Remark      string `json:"remark" binding:"max=100"`
	Fingerprint string `json:"fingerprint" binding:"oneof=chrome firefox safari edge android ios random"`
	HTTPVersion string `json:"http_version" binding:"oneof=auto 1.1 2 3"`
	Path        string `json:"path" binding:"max=100"`
	Host        string `json:"host" binding:"max=255"`
	SNI         string `json:"sni" binding:"max=255"`
}

// ConfigResponse represents the response for a config
type ConfigResponse struct {
	ID          uint      `json:"id"`
	UUID        string    `json:"uuid"`
	Remark      string    `json:"remark"`
	Fingerprint string    `json:"fingerprint"`
	HTTPVersion string    `json:"http_version"`
	Path        string    `json:"path"`
	Host        string    `json:"host"`
	SNI         string    `json:"sni"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToResponse converts Config to ConfigResponse
func (c *Config) ToResponse() ConfigResponse {
	return ConfigResponse{
		ID:          c.ID,
		UUID:        c.UUID,
		Remark:      c.Remark,
		Fingerprint: c.Fingerprint,
		HTTPVersion: c.HTTPVersion,
		Path:        c.Path,
		Host:        c.Host,
		SNI:         c.SNI,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

// XrayConfig represents the Xray configuration structure
type XrayConfig struct {
	Log       XrayLog      `json:"log"`
	Inbounds  []XrayInbound `json:"inbounds"`
	Outbounds []XrayOutbound `json:"outbounds"`
	DNS       XrayDNS      `json:"dns"`
	Routing   XrayRouting  `json:"routing"`
}

type XrayLog struct {
	LogLevel string `json:"loglevel"`
	Access   string `json:"access"`
	Error    string `json:"error"`
}

type XrayInbound struct {
	Listen        string          `json:"listen"`
	Port          int             `json:"port"`
	Protocol      string          `json:"protocol"`
	Tag           string          `json:"tag"`
	Settings      XrayInboundSettings `json:"settings"`
	StreamSettings XrayStreamSettings `json:"streamSettings"`
	Sniffing      XraySniffing    `json:"sniffing"`
}

type XrayInboundSettings struct {
	Clients     []XrayClient `json:"clients"`
	Decryption  string       `json:"decryption"`
}

type XrayClient struct {
	ID       string `json:"id"`
	Flow     string `json:"flow"`
	Email    string `json:"email"`
	Level    int    `json:"level"`
}

type XrayStreamSettings struct {
	Network      string              `json:"network"`
	Security     string              `json:"security"`
	WSSettings   XrayWSSettings      `json:"wsSettings"`
	TLSSettings  XrayTLSSettings     `json:"tlsSettings"`
}

type XrayWSSettings struct {
	Path    string            `json:"path"`
	Headers map[string]string `json:"headers"`
}

type XrayTLSSettings struct {
	ServerName   string              `json:"serverName"`
	Certificates []XrayCertificate   `json:"certificates"`
}

type XrayCertificate struct {
	CertificateFile string `json:"certificateFile"`
	KeyFile         string `json:"keyFile"`
}

type XraySniffing struct {
	Enabled      bool     `json:"enabled"`
	DestOverride []string `json:"destOverride"`
}

type XrayOutbound struct {
	Protocol string                 `json:"protocol"`
	Tag      string                 `json:"tag"`
	Settings map[string]interface{} `json:"settings,omitempty"`
}

type XrayDNS struct {
	Servers []string `json:"servers"`
}

type XrayRouting struct {
	Rules []XrayRoutingRule `json:"rules"`
}

type XrayRoutingRule struct {
	Type        string   `json:"type"`
	IP          []string `json:"ip,omitempty"`
	OutboundTag string   `json:"outboundTag"`
	Port        string   `json:"port,omitempty"`
	Protocol    []string `json:"protocol,omitempty"`
}

// ServerStatus represents server status response
type ServerStatus struct {
	XrayRunning   bool    `json:"xray_running"`
	Domain        string  `json:"domain"`
	Port          int     `json:"port"`
	ConfigCount   int64   `json:"config_count"`
	Uptime        float64 `json:"uptime"`
	MemoryUsed    uint64  `json:"memory_used"`
	MemoryTotal   uint64  `json:"memory_total"`
	CPUUsage      float64 `json:"cpu_usage"`
	XrayVersion   string  `json:"xray_version"`
}

// XrayStatus represents Xray service status
type XrayStatus struct {
	Running   bool   `json:"running"`
	Version   string `json:"version"`
	LastError string `json:"last_error"`
}

// ConfigURLResponse represents VLESS URL and JSON config
type ConfigURLResponse struct {
	URL  string                 `json:"url"`
	JSON map[string]interface{} `json:"json"`
}

// ReloadResponse represents reload response
type ReloadResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// VersionResponse represents version response
type VersionResponse struct {
	Version string `json:"version"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// SuccessResponse represents success response
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// ValidFingerprints contains valid fingerprint values
var ValidFingerprints = []string{
	"chrome", "firefox", "safari", "edge", "android", "ios", "random", "randomized",
}

// IsValidFingerprint checks if fingerprint is valid
func IsValidFingerprint(fp string) bool {
	for _, v := range ValidFingerprints {
		if v == fp {
			return true
		}
	}
	return false
}

// ValidHTTPVersions contains valid HTTP versions
var ValidHTTPVersions = []string{"auto", "1.1", "2", "3"}

// IsValidHTTPVersion checks if HTTP version is valid
func IsValidHTTPVersion(ver string) bool {
	for _, v := range ValidHTTPVersions {
		if v == ver {
			return true
		}
	}
	return false
}