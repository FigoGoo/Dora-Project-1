package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
	"sync"
)

var (
	log      *zap.Logger
	sugar    *zap.SugaredLogger
	once     sync.Once
)

// Init 初始化日志系统
func Init(mode string) error {
	var err error
	once.Do(func() {
		var config zap.Config
		if mode == "production" {
			config = zap.NewProductionConfig()
		} else {
			config = zap.NewDevelopmentConfig()
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		}
		config.OutputPaths = []string{"stdout"}
		config.ErrorOutputPaths = []string{"stderr"}

		log, err = config.Build()
		if err != nil {
			return
		}
		sugar = log.Sugar()
	})
	return err
}

// GetLogger 获取原始 logger
func GetLogger() *zap.Logger {
	if log == nil {
		_ = Init("development")
	}
	return log
}

// GetSugaredLogger 获取 sugared logger
func GetSugaredLogger() *zap.SugaredLogger {
	if sugar == nil {
		_ = Init("development")
	}
	return sugar
}

// 创建日志目录
func init() {
	_ = os.MkdirAll("logs", 0755)
}

// Debug 级别日志
func Debug(msg string, fields ...zap.Field) {
	GetLogger().Debug(msg, fields...)
}

// Info 级别日志
func Info(msg string, fields ...zap.Field) {
	GetLogger().Info(msg, fields...)
}

// Warn 级别日志
func Warn(msg string, fields ...zap.Field) {
	GetLogger().Warn(msg, fields...)
}

// Error 级别日志
func Error(msg string, fields ...zap.Field) {
	GetLogger().Error(msg, fields...)
}

// Fatal 级别日志
func Fatal(msg string, fields ...zap.Field) {
	GetLogger().Fatal(msg, fields...)
}

// With 创建带字段的 logger
func With(fields ...zap.Field) *zap.Logger {
	return GetLogger().With(fields...)
}

// S 简化版日志方法
func S() *zap.SugaredLogger {
	return GetSugaredLogger()
}

// String 便捷方法创建String字段
func String(key, val string) zap.Field {
	return zap.String(key, val)
}

// Int 便捷方法创建Int字段
func Int(key string, val int) zap.Field {
	return zap.Int(key, val)
}

// Int32 便捷方法创建Int32字段
func Int32(key string, val int32) zap.Field {
	return zap.Int32(key, val)
}

// Int64 便捷方法创建Int64字段
func Int64(key string, val int64) zap.Field {
	return zap.Int64(key, val)
}

// Uint64 便捷方法创建Uint64字段
func Uint64(key string, val uint64) zap.Field {
	return zap.Uint64(key, val)
}

// Bool 便捷方法创建Bool字段
func Bool(key string, val bool) zap.Field {
	return zap.Bool(key, val)
}

// Duration 便捷方法创建Duration字段
func Duration(key string, val interface{}) zap.Field {
	return zap.Any(key, val)
}

// Any 便捷方法创建Any字段
func Any(key string, val interface{}) zap.Field {
	return zap.Any(key, val)
}

// Error 便捷方法创建Error字段
func ErrorField(err error) zap.Field {
	return zap.Error(err)
}
