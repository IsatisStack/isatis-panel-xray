package services

import (
	"errors"
	"fmt"
	"log"

	"railway-vless-panel/backend/internal/db"
	"railway-vless-panel/backend/internal/models"
	"railway-vless-panel/backend/internal/utils"
)

// ConfigService handles configuration business logic
type ConfigService struct {
	db      *db.DB
	xraySvc *XrayService
}

// NewConfigService creates a ConfigService
func NewConfigService(database *db.DB, xraySvc *XrayService) *ConfigService {
	return &ConfigService{db: database, xraySvc: xraySvc}
}

// CreateConfigRequest for creating configs
type CreateConfigRequest struct {
	Remark      string `json:"remark"`
	Fingerprint string `json:"fingerprint"`
	HTTPVersion string `json:"http_version"`
	Path        string `json:"path"`
	Host        string `json:"host"`
	SNI         string `json:"sni"`
}

// UpdateConfigRequest for updating configs
type UpdateConfigRequest struct {
	Remark      string `json:"remark"`
	Fingerprint string `json:"fingerprint"`
	HTTPVersion string `json:"http_version"`
	Path        string `json:"path"`
	Host        string `json:"host"`
	SNI         string `json:"sni"`
}

// Create creates a new config
func (s *ConfigService) Create(req CreateConfigRequest) (*models.Config, error) {
	uuid, err := utils.GenerateUUID()
	if err != nil {
		return nil, fmt.Errorf("uuid generation failed: %w", err)
	}

	exists, err := s.db.ConfigRepository.UUIDExists(uuid)
	if err != nil {
		return nil, fmt.Errorf("uuid check failed: %w", err)
	}
	if exists {
		return nil, errors.New("uuid collision, retry")
	}

	fp := req.Fingerprint
	if fp == "" {
		fp = "chrome"
	}
	hv := req.HTTPVersion
	if hv == "" {
		hv = "auto"
	}
	p := req.Path
	if p == "" {
		p = "/ws"
	}

	config := &models.Config{
		UUID:        uuid,
		Remark:      req.Remark,
		Fingerprint: fp,
		HTTPVersion: hv,
		Path:        p,
		Host:        req.Host,
		SNI:         req.SNI,
	}

	if err := s.db.ConfigRepository.Create(config); err != nil {
		return nil, fmt.Errorf("create failed: %w", err)
	}

	// Regenerate Xray config
	if err := s.xraySvc.RegenerateConfig(); err != nil {
		log.Printf("Xray regenerate after create: %v", err)
	}

	return config, nil
}

// List returns all configs
func (s *ConfigService) List() ([]*models.Config, error) {
	return s.db.ConfigRepository.GetAll()
}

// Get returns a config by ID
func (s *ConfigService) Get(id uint) (*models.Config, error) {
	return s.db.ConfigRepository.GetByID(id)
}

// Update updates a config
func (s *ConfigService) Update(id uint, req UpdateConfigRequest) (*models.Config, error) {
	config, err := s.db.ConfigRepository.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("config not found: %w", err)
	}

	config.Remark = req.Remark
	config.Fingerprint = req.Fingerprint
	config.HTTPVersion = req.HTTPVersion
	config.Path = req.Path
	config.Host = req.Host
	config.SNI = req.SNI

	if config.Fingerprint == "" {
		config.Fingerprint = "chrome"
	}
	if config.HTTPVersion == "" {
		config.HTTPVersion = "auto"
	}
	if config.Path == "" {
		config.Path = "/ws"
	}

	if err := s.db.ConfigRepository.Update(id, config); err != nil {
		return nil, fmt.Errorf("update failed: %w", err)
	}

	if err := s.xraySvc.RegenerateConfig(); err != nil {
		log.Printf("Xray regenerate after update: %v", err)
	}

	return config, nil
}

// Delete removes a config
func (s *ConfigService) Delete(id uint) error {
	if err := s.db.ConfigRepository.Delete(id); err != nil {
		return fmt.Errorf("delete failed: %w", err)
	}

	if err := s.xraySvc.RegenerateConfig(); err != nil {
		log.Printf("Xray regenerate after delete: %v", err)
	}
	return nil
}

// GenerateVlessURL generates VLESS URL for a config
func (s *ConfigService) GenerateVlessURL(config *models.Config) string {
	host := s.xraySvc.GetDomain()
	port := s.xraySvc.GetPort()
	return GenerateVlessURL(*config, host, port)
}

// GenerateVlessJSON generates client config JSON
func (s *ConfigService) GenerateVlessJSON(config *models.Config) map[string]interface{} {
	host := s.xraySvc.GetDomain()
	port := s.xraySvc.GetPort()
	return GenerateVlessJSON(*config, host, port)
}

// GenerateQR generates QR code PNG
func (s *ConfigService) GenerateQR(config *models.Config) ([]byte, error) {
	host := s.xraySvc.GetDomain()
	port := s.xraySvc.GetPort()
	return GenerateQR(*config, host, port)
}

// GetDomain returns the Railway domain
func (s *ConfigService) GetDomain() string {
	return s.xraySvc.GetDomain()
}

// GetPort returns the Railway port
func (s *ConfigService) GetPort() string {
	return s.xraySvc.GetPort()
}