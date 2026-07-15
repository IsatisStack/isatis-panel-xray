package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"railway-vless-panel/backend/internal/config"
	"railway-vless-panel/backend/internal/services"
)

// Handler holds API handlers and dependencies
type Handler struct {
	ConfigService *services.ConfigService
	XrayService   *services.XrayService
	Config        *config.Config
}

// NewHandler creates a new Handler
func NewHandler(cfgSvc *services.ConfigService, xraySvc *services.XrayService, cfg *config.Config) *Handler {
	return &Handler{
		ConfigService: cfgSvc,
		XrayService:   xraySvc,
		Config:        cfg,
	}
}

// RegisterRoutes registers all API routes
func (h *Handler) RegisterRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/status", h.Status)
		api.GET("/version", h.Version)
		api.GET("/configs", h.ListConfigs)
		api.POST("/config", h.CreateConfig)
		api.GET("/config/:id", h.GetConfig)
		api.PUT("/config/:id", h.UpdateConfig)
		api.DELETE("/config/:id", h.DeleteConfig)
		api.POST("/reload", h.ReloadXray)
		api.GET("/config/:id/url", h.GenerateURL)
		api.GET("/config/:id/json", h.GenerateJSON)
	}
}

// Status returns server status
func (h *Handler) Status(c *gin.Context) {
	domain := h.XrayService.GetDomain()
	port := h.XrayService.GetPort()
	version, _ := h.XrayService.GetVersion()

	configs, err := h.ConfigService.List()
	configCount := 0
	if err == nil {
		configCount = len(configs)
	}

	c.JSON(http.StatusOK, gin.H{
		"running":      h.XrayService.IsRunning(),
		"xray_version": version,
		"domain":       domain,
		"port":         port,
		"config_count": configCount,
		"uptime":       h.XrayService.GetUptime(),
		"pid":          h.XrayService.GetPID(),
		"timestamp":    time.Now().Unix(),
	})
}

// Version returns Xray version
func (h *Handler) Version(c *gin.Context) {
	version, err := h.XrayService.GetVersion()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"version": version})
}

// ListConfigs returns all configs
func (h *Handler) ListConfigs(c *gin.Context) {
	configs, err := h.ConfigService.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response objects
	type ConfigResp struct {
		ID          uint   `json:"id"`
		UUID        string `json:"uuid"`
		Remark      string `json:"remark"`
		Fingerprint string `json:"fingerprint"`
		HTTPVersion string `json:"http_version"`
		Path        string `json:"path"`
		Host        string `json:"host"`
		SNI         string `json:"sni"`
		CreatedAt   string `json:"created_at"`
		UpdatedAt   string `json:"updated_at"`
	}

	var resp []ConfigResp
	for _, cfg := range configs {
		resp = append(resp, ConfigResp{
			ID:          cfg.ID,
			UUID:        cfg.UUID,
			Remark:      cfg.Remark,
			Fingerprint: cfg.Fingerprint,
			HTTPVersion: cfg.HTTPVersion,
			Path:        cfg.Path,
			Host:        cfg.Host,
			SNI:         cfg.SNI,
			CreatedAt:   cfg.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   cfg.UpdatedAt.Format(time.RFC3339),
		})
	}
	if resp == nil {
		resp = []ConfigResp{}
	}

	c.JSON(http.StatusOK, resp)
}

// CreateConfig creates a new config
func (h *Handler) CreateConfig(c *gin.Context) {
	var req services.CreateConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := h.ConfigService.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":           config.ID,
		"uuid":         config.UUID,
		"remark":       config.Remark,
		"fingerprint":  config.Fingerprint,
		"http_version": config.HTTPVersion,
		"path":         config.Path,
		"host":         config.Host,
		"sni":          config.SNI,
		"created_at":   config.CreatedAt,
		"updated_at":   config.UpdatedAt,
	})
}

// GetConfig returns a config by ID
func (h *Handler) GetConfig(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	config, err := h.ConfigService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Config not found"})
		return
	}

	c.JSON(http.StatusOK, config.ToResponse())
}

// UpdateConfig updates a config
func (h *Handler) UpdateConfig(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	var req services.UpdateConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := h.ConfigService.Update(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, config.ToResponse())
}

// DeleteConfig deletes a config
func (h *Handler) DeleteConfig(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	if err := h.ConfigService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ReloadXray reloads Xray config
func (h *Handler) ReloadXray(c *gin.Context) {
	if err := h.XrayService.RegenerateConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reloaded"})
}

// GenerateURL generates VLESS URL
func (h *Handler) GenerateURL(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	config, err := h.ConfigService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Config not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":  h.ConfigService.GenerateVlessURL(config),
		"json": h.ConfigService.GenerateVlessJSON(config),
	})
}

// GenerateJSON generates client config JSON
func (h *Handler) GenerateJSON(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	config, err := h.ConfigService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Config not found"})
		return
	}

	c.JSON(http.StatusOK, h.ConfigService.GenerateVlessJSON(config))
}