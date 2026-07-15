package api

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"

	"railway-vless-panel/backend/internal/config"
)

// SetupRouter configures and returns the Gin router
func SetupRouter(handler *Handler, cfg *config.Config) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(gin.Logger())

	// Register API routes
	handler.RegisterRoutes(router)

	// Frontend static file serving
	frontendPath := cfg.FrontendPath
	if frontendPath == "" {
		frontendPath = "./frontend/dist"
	}

	if _, err := os.Stat(frontendPath); err == nil {
		router.Static("/assets", filepath.Join(frontendPath, "assets"))
		router.StaticFile("/", filepath.Join(frontendPath, "index.html"))

		// SPA fallback - serve index.html for non-API routes
		router.NoRoute(func(c *gin.Context) {
			if filepath.HasPrefix(c.Request.URL.Path, "/api/") {
				c.JSON(404, gin.H{"error": "not found"})
				return
			}
			indexPath := filepath.Join(frontendPath, "index.html")
			if _, err := os.Stat(indexPath); err == nil {
				c.File(indexPath)
			} else {
				c.JSON(404, gin.H{"error": "not found"})
			}
		})
	}

	return router
}

// corsMiddleware handles CORS
func corsMiddleware(origins []string) gin.HandlerFunc {
	allowAll := len(origins) == 1 && origins[0] == "*"

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if allowAll {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else if origin != "" {
			for _, o := range origins {
				if o == origin {
					c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}