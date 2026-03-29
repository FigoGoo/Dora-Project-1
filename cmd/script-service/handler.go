package main

import (
	"context"
	"dora-magic-box/internal/pkg/logger"
)

// CommonMiddleware 通用中间件
func CommonMiddleware(next endpoint.Endpoint) endpoint.Endpoint {
	return func(ctx context.Context, request, response interface{}) error {
		logger.Info("CommonMiddleware called")
		return next(ctx, request, response)
	}
}

// ServerMiddleware 服务端中间件
func ServerMiddleware(next endpoint.Endpoint) endpoint.Endpoint {
	return func(ctx context.Context, request, response interface{}) error {
		logger.Info("ServerMiddleware called")
		return next(ctx, request, response)
	}
}
