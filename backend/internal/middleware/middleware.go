package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// CORS returns a CORS middleware
func CORS(origins []string) gin.HandlerFunc {
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
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RateLimit returns a rate limiting middleware
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	type client struct {
		count    int
		lastSeen int64
	}

	var (
		mu       sync.Mutex
		clients  = make(map[string]client)
		cleanup  = window
	)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now().UnixNano()

		mu.Lock()
		// Cleanup
		for k, v := range clients {
			if now-v.lastSeen > int64(cleanup*2) {
				delete(clients, k)
			}
		}

		cli := clients[ip]
		if now-cli.lastSeen > int64(window) {
			cli = client{count: 1, lastSeen: now}
		} else {
			cli.count++
			cli.lastSeen = now
		}
		clients[ip] = cli
		count := cli.count
		mu.Unlock()

		if count > limit {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "rate_limit_exceeded",
				"message":     "Too many requests",
				"retry_after": window.Seconds(),
			})
			return
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", limit-count))
		c.Next()
	}
}

// Logger returns a request logging middleware
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		status := c.Writer.Status()
		if status >= 400 {
			fmt.Printf("[ERROR] %s %s %d %s %dms\n",
				c.Request.Method, c.Request.URL.Path, status, c.ClientIP(), latency.Milliseconds())
		}
	}
}

// SecurityHeaders returns security headers middleware
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("X-XSS-Protection", "0")
		c.Writer.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
		c.Writer.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:;")
		c.Next()
	}
}

// Recovery returns panic recovery middleware
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		fmt.Printf("Panic recovered: %v\n", recovered)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
	})
}