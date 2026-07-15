package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"railway-vless-panel/backend/internal/api"
	"railway-vless-panel/backend/internal/config"
	"railway-vless-panel/backend/internal/db"
	"railway-vless-panel/backend/internal/middleware"
	"railway-vless-panel/backend/internal/services"
)

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Railway VLESS Panel starting...")

	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	log.Printf("Config loaded: port=%s, db=%s", cfg.Port, cfg.DatabasePath)

	// Ensure data dirs
	if err := os.MkdirAll(cfg.DatabasePath[:len(cfg.DatabasePath)-len("/panel.db")], 0755); err != nil {
		log.Printf("Warning: create db dir: %v", err)
	}
	if err := os.MkdirAll(cfg.LogDir, 0755); err != nil {
		log.Printf("Warning: create log dir: %v", err)
	}

	// Initialize database
	closeDB, err := db.Connect(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	database := db.GetDB()
	log.Println("Database initialized")

	// Initialize services
	xraySvc := services.NewXrayService(cfg, database)
	cfgSvc := services.NewConfigService(database, xraySvc)
	log.Println("Services initialized")

	// Start Xray (best-effort, may not have binary in dev)
	if err := xraySvc.Start(); err != nil {
		log.Printf("Warning: Xray failed to start: %v", err)
	}

	// Setup router
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := api.SetupRouter(api.NewHandler(cfgSvc, xraySvc, cfg), cfg)

	// Apply middleware (in order)
	router.Use(middleware.CORS(cfg.CORSOrigins))
	router.Use(middleware.RateLimit(100, time.Minute))
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.Logger())

	// HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("Server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	<-quit
	log.Println("Shutdown signal received")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Forced shutdown: %v", err)
	}

	if err := xraySvc.Stop(); err != nil {
		log.Printf("Xray stop error: %v", err)
	}

	if closeDB != nil {
		_ = closeDB()
	}
	log.Println("Server stopped")
}