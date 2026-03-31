package main

import (
	"context"
	"fmt"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/middleware"
	"dora-magic-box/internal/pkg/registry"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/hlog"
)

func main() {
	// 初始化配置
	if err := config.Init("configs/config.yaml"); err != nil {
		panic(err)
	}

	// 初始化日志
	if err := logger.Init(config.Get().App.Mode); err != nil {
		panic(err)
	}

	// 初始化数据库
	if err := db.Init(); err != nil {
		logger.Fatal("数据库初始化失败", logger.GetLogger().Any("error", err))
	}

	cfg := config.MustGet()

	// 初始化服务注册与发现
	if err := registry.InitRegistry(
		false,                   // 开发环境使用内存实现
		cfg.Etcd.Endpoints,
		cfg.Etcd.DialTimeout,
		cfg.Etcd.Username,
		cfg.Etcd.Password,
	); err != nil {
		logger.Fatal("注册中心初始化失败", logger.GetLogger().Any("error", err))
	}

	// 创建 Hertz 服务器
	h := server.Default(
		server.WithHostPorts(fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)),
		server.WithHandleTimeout(30 * time.Second),
	)

	// 注册中间件
	h.Use(middleware.Recovery())
	h.Use(middleware.Cors())
	h.Use(middleware.Logger())

	// 注册路由
	registerRoutes(h)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "api-gateway",
		Address:     cfg.Server.Host,
		Port:        cfg.Server.Port,
		Metadata: map[string]string{
			"version": "v1.0.0",
			"type":    "api",
		},
	}
	ctx := context.Background()
	if err := registry.GetRegistry().Register(ctx, instance, 30); err != nil {
		logger.Fatal("服务注册失败", logger.GetLogger().Any("error", err))
	}

	// 服务停止时注销
	defer func() {
		if err := registry.GetRegistry().Unregister(ctx, instance); err != nil {
			logger.Error("服务注销失败", logger.GetLogger().Any("error", err))
		}
		logger.Info("API Gateway 已停止")
	}()

	// 启动服务
	logger.Info("API Gateway 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)

	h.Spin()
}

func registerRoutes(h *server.Hertz) {
	// 健康检查
	h.GET("/health", func(c context.Context, ctx *app.RequestContext) {
		middleware.Success(ctx, map[string]string{"status": "ok"})
	})

	// API v1
	v1 := h.Group("/api/v1")
	{
		// 项目相关
		v1.POST("/projects", createProject)
		v1.GET("/projects/:id", getProject)
		v1.GET("/projects", listProjects)
		v1.DELETE("/projects/:id", deleteProject)

		// 剧本相关
		v1.POST("/projects/:id/scripts", generateScript)
		v1.GET("/scripts/:id", getScript)

		// 分镜相关
		v1.POST("/scripts/:id/storyboards", splitStoryboard)
		v1.GET("/projects/:id/storyboards", getStoryboards)

		// 画面相关
		v1.POST("/storyboards/:id/images", generateImage)
		v1.GET("/images/:id", getImage)

		// 视频相关
		v1.POST("/storyboards/:id/videos", generateVideo)
		v1.GET("/videos/:id", getVideo)

		// 合并相关
		v1.POST("/projects/:id/merge", mergeVideo)
		v1.GET("/videos/:id/download", downloadVideo)
		v1.POST("/videos/:id/publish", publishVideo)
	}
}

// TODO: 实现各个 handler 函数
func createProject(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func getProject(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func listProjects(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func deleteProject(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func generateScript(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func getScript(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func splitStoryboard(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func getStoryboards(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func generateImage(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func getImage(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func generateVideo(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func getVideo(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func mergeVideo(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func downloadVideo(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}

func publishVideo(c context.Context, ctx *app.RequestContext) {
	middleware.Success(ctx, nil)
}
