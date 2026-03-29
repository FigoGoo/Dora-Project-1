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

	// svr := mergeservice.NewServer(new(MergeServiceImpl),
	// 	server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{ServiceName: "merge-service"}),
	// 	server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	// )
	// svr.Run()

	logger.Info("Merge Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)
}

// MergeServiceImpl 合并服务实现
type MergeServiceImpl struct{}

// MergeVideo
// func (s *MergeServiceImpl) MergeVideo() (resp *merge.MergeVideoResp, err error) {
// 	logger.Info("MergeVideo called - 使用 FFmpeg 拼接视频")
// 	return &merge.MergeVideoResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: &merge.MergedVideoInfo{},
// 	}, nil
// }

// DownloadVideo
// func (s *MergeServiceImpl) DownloadVideo() (resp *merge.DownloadVideoResp, err error) {
// 	logger.Info("DownloadVideo called")
// 	return &merge.DownloadVideoResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		DownloadUrl: "",
// 	}, nil
// }

// PublishVideo
// func (s *MergeServiceImpl) PublishVideo() (resp *merge.PublishVideoResp, err error) {
// 	logger.Info("PublishVideo called")
// 	return &merge.PublishVideoResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		PublishedUrl: "",
// 	}, nil
// }
