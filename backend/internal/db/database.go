package db

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"railway-vless-panel/backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// ConfigRepository defines the interface for config storage
type ConfigRepository interface {
	Create(config *models.Config) error
	GetAll() ([]*models.Config, error)
	GetByID(id uint) (*models.Config, error)
	GetByUUID(uuid string) (*models.Config, error)
	Update(id uint, config *models.Config) error
	Delete(id uint) error
	Count() (int64, error)
	UUIDExists(uuid string) (bool, error)
}

// SettingRepository defines the interface for settings storage
type SettingRepository interface {
	Get(key string) (string, error)
	Set(key, value string) error
}

// SQLiteConfigRepository implements ConfigRepository with SQLite
type SQLiteConfigRepository struct {
	db *gorm.DB
}

func NewSQLiteConfigRepository(db *gorm.DB) *SQLiteConfigRepository {
	return &SQLiteConfigRepository{db: db}
}

func (r *SQLiteConfigRepository) Create(config *models.Config) error {
	return r.db.Create(config).Error
}

func (r *SQLiteConfigRepository) GetAll() ([]*models.Config, error) {
	var configs []*models.Config
	err := r.db.Order("created_at DESC").Find(&configs).Error
	return configs, err
}

func (r *SQLiteConfigRepository) GetByID(id uint) (*models.Config, error) {
	var config models.Config
	err := r.db.First(&config, id).Error
	return &config, err
}

func (r *SQLiteConfigRepository) GetByUUID(uuid string) (*models.Config, error) {
	var config models.Config
	err := r.db.Where("uuid = ?", uuid).First(&config).Error
	return &config, err
}

func (r *SQLiteConfigRepository) Update(id uint, config *models.Config) error {
	return r.db.Model(&models.Config{}).Where("id = ?", id).Updates(config).Error
}

func (r *SQLiteConfigRepository) Delete(id uint) error {
	return r.db.Delete(&models.Config{}, id).Error
}

func (r *SQLiteConfigRepository) Count() (int64, error) {
	var count int64
	return count, r.db.Model(&models.Config{}).Count(&count).Error
}

func (r *SQLiteConfigRepository) UUIDExists(uuid string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Config{}).Where("uuid = ?", uuid).Count(&count).Error
	return count > 0, err
}

// SQLiteSettingRepository implements SettingRepository with SQLite
type SQLiteSettingRepository struct {
	db *gorm.DB
}

func NewSQLiteSettingRepository(db *gorm.DB) *SQLiteSettingRepository {
	return &SQLiteSettingRepository{db: db}
}

func (r *SQLiteSettingRepository) Get(key string) (string, error) {
	var setting models.Setting
	err := r.db.Where("key = ?", key).First(&setting).Error
	return setting.Value, err
}

func (r *SQLiteSettingRepository) Set(key, value string) error {
	return r.db.Where("key = ?", key).Assign(models.Setting{Value: value}).FirstOrCreate(&models.Setting{Key: key}).Error
}

// DB wraps the database connection with repository access
type DB struct {
	*gorm.DB
	ConfigRepository
	SettingRepository
}

// Connect initializes the database connection
func Connect(dbPath string) (func() error, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory %s: %w", dir, err)
	}

	gormDB, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := gormDB.AutoMigrate(&models.Config{}, &models.Setting{}); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	database = &DB{
		DB:                gormDB,
		ConfigRepository:  NewSQLiteConfigRepository(gormDB),
		SettingRepository: NewSQLiteSettingRepository(gormDB),
	}

	sqlDB, _ := gormDB.DB()
	closeFn := func() error {
		if sqlDB != nil {
			return sqlDB.Close()
		}
		return nil
	}

	return closeFn, nil
}

// Global DB instance
var database *DB
var mu sync.Mutex

// GetDB returns the global DB instance
func GetDB() *DB {
	mu.Lock()
	defer mu.Unlock()
	return database
}

// InitializeDB sets the global DB instance
func InitializeDB(db *DB) error {
	mu.Lock()
	defer mu.Unlock()
	database = db
	return nil
}

// CloseDB closes the database connection
func CloseDB() {
	mu.Lock()
	defer mu.Unlock()
	if database != nil && database.DB != nil {
		sqlDB, err := database.DB.DB()
		if err == nil && sqlDB != nil {
			sqlDB.Close()
		}
	}
}