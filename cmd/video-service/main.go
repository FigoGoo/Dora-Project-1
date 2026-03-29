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
	if err := config.Init("configs/config.yaml"); err != nil {
		panic(err)
	}
	if err := logger.Init(config.Get().App.Mode); err != nil {
		panic(err)
	}
	if err := db.Init(); err != nil {
		logger.Fatal("数据库初始化失败", logger.GetLogger().Any("error", err))
	}

	cfg := config.MustGet()

	// svr := videoservice.NewServer(new(VideoServiceImpl),
	// 	server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{ServiceName: "video-service"}),
	// 	server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	// )
	// svr.Run()

	logger.Info("Video Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)
}

// VideoServiceImpl 视频服务实现
type VideoServiceImpl struct{}

// GenerateVideo
// func (s *VideoServiceImpl) GenerateVideo() (resp *video.GenerateVideoResp, err error) {
// 	logger.Info("GenerateVideo called")
// 	return &video.GenerateVideoResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: &video.VideoInfo{},
// 	}, nil
// }

// GetVideo
// func (s *VideoServiceImpl) GetVideo() (resp *video.GetVideoResp, err error) {
// 	logger.Info("GetVideo called")
// 	return &video.GetVideoResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: &video.VideoInfo{},
// 	}, nil
// }
