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

	// svr := imageservice.NewServer(new(ImageServiceImpl),
	// 	server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{ServiceName: "image-service"}),
	// 	server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	// )
	// svr.Run()

	logger.Info("Image Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)
}

// ImageServiceImpl 画面服务实现
type ImageServiceImpl struct{}

// GenerateImage
// func (s *ImageServiceImpl) GenerateImage(ctx context.Context, req *image.GenerateImageReq) (resp *image.GenerateImageResp, err error) {
// 	logger.Info("GenerateImage called")
// 	return &image.GenerateImageResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: &image.ImageInfo{},
// 	}, nil
// }

// BatchGenerateImages
// func (s *ImageServiceImpl) BatchGenerateImages(ctx context.Context, req *image.BatchGenerateImagesReq) (resp *image.BatchGenerateImagesResp, err error) {
// 	logger.Info("BatchGenerateImages called")
// 	return &image.BatchGenerateImagesResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: []*image.ImageInfo{},
// 	}, nil
// }
