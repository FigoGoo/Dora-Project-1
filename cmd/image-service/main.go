package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/registry"
	"dora-magic-box/kitex_gen/base"
	"dora-magic-box/kitex_gen/image"
	"dora-magic-box/kitex_gen/image/imageservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"github.com/google/uuid"
	"net"
	"time"
)

// ImageServiceImpl 画面服务实现
type ImageServiceImpl struct{}

// GenerateImage 生成画面
func (s *ImageServiceImpl) GenerateImage(ctx context.Context, req *image.GenerateImageReq) (resp *image.GenerateImageResp, err error) {
	logger.Info("GenerateImage called",
		logger.GetLogger().String("storyboard_id", req.StoryboardId),
		logger.GetLogger().String("prompt", req.Prompt),
	)

	// 创建画面记录
	imageModel := &db.Image{
		StoryboardID: 1, // 暂时使用固定值，实际应从 req.StoryboardId 转换
		URL:          "https://example.com/images/" + uuid.New().String() + ".png",
		Prompt:       req.Prompt,
		Model:        "banana-2",
		Status:       "completed",
	}

	db.Get().Create(imageModel)

	return &image.GenerateImageResp{
		Base: &base.BaseResp{
			Code: 0,
			Msg:  "success",
		},
		Data: &image.ImageInfo{
			Id:            uuid.New().String(),
			StoryboardId:  req.StoryboardId,
			Url:           "https://example.com/images/" + uuid.New().String() + ".png",
			Prompt:        req.Prompt,
			Model:         "banana-2",
			Status:        "completed",
			CreatedAt:     time.Now().Format(time.RFC3339),
		},
	}, nil
}

// BatchGenerateImages 批量生成画面
func (s *ImageServiceImpl) BatchGenerateImages(ctx context.Context, req *image.BatchGenerateImagesReq) (resp *image.BatchGenerateImagesResp, err error) {
	logger.Info("BatchGenerateImages called",
		logger.GetLogger().Int("storyboard_count", len(req.StoryboardIds)),
	)

	var images []*image.ImageInfo

	for _, id := range req.StoryboardIds {
		images = append(images, &image.ImageInfo{
			Id:            uuid.New().String(),
			StoryboardId:  id,
			Url:           "https://example.com/images/" + uuid.New().String() + ".png",
			Prompt:        "批量生成的画面" + id,
			Model:         "banana-2",
			Status:        "completed",
			CreatedAt:     time.Now().Format(time.RFC3339),
		})
	}

	return &image.BatchGenerateImagesResp{
		Base: &base.BaseResp{
			Code: 0,
			Msg:  "success",
		},
		Data: images,
	}, nil
}

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

	svr := imageservice.NewServer(new(ImageServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{ServiceName: "image-service"}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "image-service",
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
		logger.Info("Image Service 已停止")
	}()

	logger.Info("Image Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)

	svr.Run()
}
