package db

import (
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	gorm_logger "gorm.io/gorm/logger"
	"sync"
	"time"
)

var (
	db   *gorm.DB
	once sync.Once
)

// Init 初始化数据库连接
func Init() error {
	var err error
	once.Do(func() {
		cfg := config.MustGet()

		gormConfig := &gorm.Config{
			Logger: gorm_logger.Default.LogMode(gorm_logger.Info),
		}

		db, err = gorm.Open(mysql.Open(cfg.MySQL.DSN()), gormConfig)
		if err != nil {
			err = fmt.Errorf("连接数据库失败: %w", err)
			return
		}

		sqlDB, err := db.DB()
		if err != nil {
			return
		}

		// 设置连接池
		sqlDB.SetMaxIdleConns(cfg.MySQL.MaxIdleConns)
		sqlDB.SetMaxOpenConns(cfg.MySQL.MaxOpenConns)
		sqlDB.SetConnMaxLifetime(time.Hour)

		// 自动迁移
		if err = AutoMigrate(); err != nil {
			logger.Error("数据库迁移失败", logger.Any("error", err))
		}

		logger.Info("数据库连接成功")
	})
	return err
}

// Get 获取数据库实例
func Get() *gorm.DB {
	if db == nil {
		_ = Init()
	}
	return db
}

// AutoMigrate 自动迁移表结构
func AutoMigrate() error {
	return db.AutoMigrate(
		&User{},
		&Project{},
		&Script{},
		&Storyboard{},
		&Image{},
		&Video{},
		&MergedVideo{},
		&ModelConfig{},
	)
}
