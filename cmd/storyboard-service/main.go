package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/registry"
	"dora-magic-box/kitex_gen/base"
	"dora-magic-box/kitex_gen/storyboard"
	"dora-magic-box/kitex_gen/storyboard/storyboardservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"github.com/google/uuid"
	"net"
	"time"
)

// StoryboardServiceImpl 分镜服务实现
type StoryboardServiceImpl struct{}

// SplitStoryboard 拆解分镜
func (s *StoryboardServiceImpl) SplitStoryboard(ctx context.Context, req *storyboard.SplitStoryboardReq) (resp *storyboard.SplitStoryboardResp, err error) {
	logger.Info("SplitStoryboard called",
		logger.GetLogger().String("script_id", req.ScriptId),
	)

	// 模拟分镜拆解
	var storyboards []*storyboard.StoryboardInfo

	for i := 1; i <= 5; i++ {
		storyboards = append(storyboards, &storyboard.StoryboardInfo{
			Id:          uuid.New().String(),
			ProjectId:   "1",
			ScriptId:    req.ScriptId,
			Sequence:    int32(i),
			Description: "第" + string(rune(i+'0')) + "个镜头描述",
			Prompt:      "第" + string(rune(i+'0')) + "个镜头提示词",
			Duration:    3,
			Status:      "completed",
		})
	}

	// 保存分镜记录到数据库
	for _, sb := range storyboards {
		db.Get().Create(&db.Storyboard{
			ProjectID:   1,
			ScriptID:    1,
			Sequence:    sb.Sequence,
			Description: sb.Description,
			Prompt:      sb.Prompt,
			Duration:    int(sb.Duration),
			Status:      sb.Status,
		})
	}

	return &storyboard.SplitStoryboardResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: storyboards,
	}, nil
}

// GetStoryboards 获取分镜列表
func (s *StoryboardServiceImpl) GetStoryboards(ctx context.Context, req *storyboard.GetStoryboardsReq) (resp *storyboard.GetStoryboardsResp, err error) {
	logger.Info("GetStoryboards called",
		logger.GetLogger().String("project_id", req.ProjectId),
	)

	// 模拟获取分镜列表
	var storyboards []*storyboard.StoryboardInfo

	for i := 1; i <= 3; i++ {
		storyboards = append(storyboards, &storyboard.StoryboardInfo{
			Id:          uuid.New().String(),
			ProjectId:   req.ProjectId,
			ScriptId:    "1",
			Sequence:    int32(i),
			Description: "第" + string(rune(i+'0')) + "个镜头描述",
			Prompt:      "第" + string(rune(i+'0')) + "个镜头提示词",
			Duration:    3,
			Status:      "completed",
		})
	}

	return &storyboard.GetStoryboardsResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: storyboards,
	}, nil
}

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

	// 创建服务
	svr := storyboardservice.NewServer(new(StoryboardServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
			ServiceName: "storyboard-service",
		}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "storyboard-service",
		Address:     cfg.Server.Host,
		Port:        cfg.Server.Port,
		Metadata: map[string]string{
			"version": "v1.0.0",
			"type":    "core",
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
		logger.Info("Storyboard Service 已停止")
	}()

	logger.Info("Storyboard Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)

	svr.Run()
}
