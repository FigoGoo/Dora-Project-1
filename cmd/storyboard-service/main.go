package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"github.com/cloudwego/kitex/server"
	"net"
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

	// 创建服务
	// svr := storyboardservice.NewServer(new(StoryboardServiceImpl),
	// 	server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
	// 		ServiceName: "storyboard-service",
	// 	}),
	// 	server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	// )

	// svr.Run()

	logger.Info("Storyboard Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)
}

// StoryboardServiceImpl 分镜服务实现
type StoryboardServiceImpl struct{}

// SplitStoryboard 拆解分镜
// func (s *StoryboardServiceImpl) SplitStoryboard(ctx context.Context, req *storyboard.SplitStoryboardReq) (resp *storyboard.SplitStoryboardResp, err error) {
// 	logger.Info("SplitStoryboard called")
// 	// TODO: 实现分镜拆解逻辑
// 	return &storyboard.SplitStoryboardResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: []*storyboard.StoryboardInfo{},
// 	}, nil
// }

// GetStoryboards
// func (s *StoryboardServiceImpl) GetStoryboards(ctx context.Context, req *storyboard.GetStoryboardsReq) (resp *storyboard.GetStoryboardsResp, err error) {
// 	logger.Info("GetStoryboards called")
// 	return &storyboard.GetStoryboardsResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: []*storyboard.StoryboardInfo{},
// 	}, nil
// }
