package handlers

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/railway-vless-panel/backend/internal/db"
	"github.com/railway-vless-panel/backend/internal/models"
	"github.com/railway-vless-panel/backend/internal/services"
)

// getHandlerParams extracts common handler parameters
func getHandlerParams(c *gin.Context) map[string]interface{} {
	return map[string]interface{}{
		"db":         db.GetDB(),
		"configSvc":  services.NewConfigService(db.GetDB(), services.NewXrayService(services.NewXrayServiceParams{}), config.GetConfig()),
		"xraySvc":    services.NewXrayService(services.XrayServiceParams{}),
	}
}

// ListConfig returns all configs
func ListConfig(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		configSvc := param["configSvc"].(*services.ConfigService)
		configs, err := configSvc.List()
		if err != nil {
			c.JSON(500, gin.H{"error": "list failed", "message": err.Error()})
			return
		}
		c.JSON(200, configs)
	}
}

// GetConfig returns a config by ID
func GetConfig(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		configSvc := param["configSvc"].(*services.ConfigService)
		config, err := configSvc.Get(id)
		if err != nil {
			c.JSON(404, gin.H{"error": "not found", "message": "Config not found"})
			return
		}
		if config == nil {
			c.JSON(404, gin.H{"error": "not found", "message": "Config not found"})
			return
		}
		c.JSON(200, config)
	}
}

// CreateConfig creates a new config
func CreateConfig(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.ConfigCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "invalid request", "message": err.Error()})
			return
		}
		configSvc := param["configSvc"].(*services.ConfigService)
		config, err := configSvc.Create(&req)
		if err != nil {
			c.JSON(400, gin.H{"error": "create failed", "message": err.Error()})
			return
		}
		c.JSON(201, config)
	}
}

// ReloadXray reloads Xray service
func ReloadXray(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		xraySvc := param["xraySvc"]
		if xraySvc == nil {
			c.JSON(500, gin.H{"error": "xray service", "message": "Service not initialized"})
			return
		}
		if err := xraySvc.(*services.XrayServiceImpl).Reload(); err != nil {
			c.JSON(500, gin.H{"error": "reload failed", "message": err.Error()})
			return
		}
		c.JSON(200, gin.H{"success": true, "message": "Reloaded"})
	}
}

// DeleteConfig deletes a config
func DeleteConfig(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		configSvc := param["configSvc"].(*services.ConfigService)
		if err := configSvc.Delete(id); err != nil {
			c.JSON(400, gin.H{"error": "delete failed", "message": err.Error()})
			return
		}
		c.JSON(200, gin.H{"success": true, "message": "Deleted"})
	}
}

// UpdateConfig updates a config
func UpdateConfig(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		var req models.ConfigUpdateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "invalid request", "message": err.Error()})
			return
		}
		configSvc := param["configSvc"].(*services.ConfigService)
		config, err := configSvc.Update(id, &req)
		if err != nil {
			c.JSON(400, gin.H{"error": "update failed", "message": err.Error()})
			return
		}
		if config == nil {
			c.JSON(404, gin.H{"error": "not found", "message": "Config not found"})
			return
		}
		c.JSON(200, config)
	}
}

// GetStatus returns server status
func GetStatus(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		xraySvc := param["xraySvc"].(*services.XrayServiceImpl)
		status, err := xraySvc.GetStatus()
		if err != nil {
			c.JSON(500, gin.H{"error": "status failed", "message": err.Error()})
			return
		}
		c.JSON(200, gin.H{
			"running": status.Running,
			"version": status.Version,
			"uptime":  status.Uptime,
		})
	}
}

// Version returns Xray version
func Version(param map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		xraySvc := param["xraySvc"].(*services.XrayServiceImpl)
		version, err := xraySvc.GetVersion()
		if err != nil {
			c.JSON(500, gin.H{"error": "version failed", "message": err.Error()})
			return
		}
		c.JSON(200, gin.H{"version": version})
	}
	// Alternative version
	/*
		v, _ := xraySvc.GetVersion()
		c.JSON(200, gin.H{"version": v})
	*/
}