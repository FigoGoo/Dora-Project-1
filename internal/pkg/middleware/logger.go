package middleware

import (
	"context"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"time"
	"dora-magic-box/internal/pkg/logger"
)

// Logger 日志中间件
func Logger() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		start := time.Now()
		path := ctx.Request.URI().Path()
		method := string(ctx.Request.Method())

		ctx.Next(c)

		latency := time.Since(start)
		statusCode := ctx.Response.StatusCode()

		logger.Info("HTTP Request",
			logger.String("path", string(path)),
			logger.String("method", method),
			logger.Int("status", statusCode),
			logger.Duration("latency", latency),
		)
	}
}

// Recovery 恢复中间件
func Recovery() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered",
					logger.Any("error", err),
				)
				InternalError(ctx, "Internal Server Error")
			}
		}()
		ctx.Next(c)
	}
}

// Cors 跨域中间件
func Cors() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if string(ctx.Request.Method()) == "OPTIONS" {
			ctx.SetStatusCode(consts.StatusOK)
			return
		}
		ctx.Next(c)
	}
}
