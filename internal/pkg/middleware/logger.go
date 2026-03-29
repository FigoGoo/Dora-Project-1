package middleware

import (
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"time"
	"dora-magic-box/internal/pkg/logger"
)

// Logger 日志中间件
func Logger() app.HandlerFunc {
	return func(c *app.RequestContext) {
		start := time.Now()
		path := c.Request.URI().Path()
		method := string(c.Request.Method())

		c.Next(c)

		latency := time.Since(start)
		statusCode := c.Response.StatusCode()

		logger.Info("HTTP Request",
			logger.GetLogger().String("path", string(path)),
			logger.GetLogger().String("method", method),
			logger.GetLogger().Int("status", statusCode),
			logger.GetLogger().Duration("latency", latency),
		)
	}
}

// Recovery 恢复中间件
func Recovery() app.HandlerFunc {
	return func(c *app.RequestContext) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered",
					logger.GetLogger().Any("error", err),
				)
				InternalError(c, "Internal Server Error")
			}
		}()
		c.Next(c)
	}
}

// Cors 跨域中间件
func Cors() app.HandlerFunc {
	return func(c *app.RequestContext) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if string(c.Request.Method()) == "OPTIONS" {
			c.SetStatusCode(consts.StatusOK)
			return
		}
		c.Next(c)
	}
}
