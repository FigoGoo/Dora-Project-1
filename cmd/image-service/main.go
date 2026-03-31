package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/queue"
	"dora-magic-box/internal/pkg/registry"
	"dora-magic-box/internal/pkg/util"
	"dora-magic-box/kitex_gen/base"
	"dora-magic-box/kitex_gen/image"
	"dora-magic-box/kitex_gen/image/imageservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"net"
	"time"
)

// ImageServiceImpl 画面服务实现
type ImageServiceImpl struct{}

// GenerateImage 生成画面
func (s *ImageServiceImpl) GenerateImage(ctx context.Context, req *image.GenerateImageReq) (resp *image.GenerateImageResp, err error) {
	logger.Info("GenerateImage called",
		logger.String("storyboard_id", req.StoryboardId),
		logger.String("prompt", req.Prompt),
	)

	storyboardID, err := util.StringToUint64(req.StoryboardId)
	if err != nil {
		logger.Error("无效的分镜ID", logger.String("storyboard_id", req.StoryboardId), logger.ErrorField(err))
		return &image.GenerateImageResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的分镜ID",
			},
			Data: nil,
		}, nil
	}

	// 创建画面记录
	imageModel := &db.Image{
		StoryboardID: storyboardID,
		URL:          "https://example.com/images/" + time.Now().Format("20060102150405") + ".png",
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
			Id:            util.Uint64ToString(imageModel.ID),
			StoryboardId:  req.StoryboardId,
			Url:           imageModel.URL,
			Prompt:        req.Prompt,
			Model:         "banana-2",
			Status:        "completed",
			CreatedAt:     util.FormatTimeToString(imageModel.CreatedAt),
		},
	}, nil
}

// BatchGenerateImages 批量生成画面
func (s *ImageServiceImpl) BatchGenerateImages(ctx context.Context, req *image.BatchGenerateImagesReq) (resp *image.BatchGenerateImagesResp, err error) {
	logger.Info("BatchGenerateImages called",
		logger.Int("storyboard_count", len(req.StoryboardIds)),
	)

	var images []*image.ImageInfo

	for _, idStr := range req.StoryboardIds {
		storyboardID, err := util.StringToUint64(idStr)
		if err != nil {
			logger.Error("无效的分镜ID", logger.String("storyboard_id", idStr), logger.ErrorField(err))
			continue
		}

		// 创建画面记录
		imageModel := &db.Image{
			StoryboardID: storyboardID,
			URL:          "https://example.com/images/" + time.Now().Format("20060102150405") + "_" + idStr + ".png",
			Prompt:        "批量生成的画面" + idStr,
			Model:         "banana-2",
			Status:        "completed",
		}

		db.Get().Create(imageModel)

		images = append(images, &image.ImageInfo{
			Id:            util.Uint64ToString(imageModel.ID),
			StoryboardId:  idStr,
			Url:           imageModel.URL,
			Prompt:        "批量生成的画面" + idStr,
			Model:         "banana-2",
			Status:        "completed",
			CreatedAt:     util.FormatTimeToString(imageModel.CreatedAt),
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
		logger.Fatal("数据库初始化失败", logger.Any("error", err))
	}

	cfg := config.MustGet()

	// 初始化消息队列
	if err := queue.Init(&cfg.RocketMQ); err != nil {
		logger.Fatal("消息队列初始化失败", logger.Any("error", err))
	}

	// 启动图像生成任务消费者
	if err := queue.StartConsumer("image", func(msg *queue.QueueMessage) error {
		logger.Info("处理图像生成任务", logger.Any("msg", msg))

		imageID, ok := msg.Data["image_id"].(string)
		if !ok {
			return nil // 忽略无效消息
		}

		// 模拟图像生成
		time.Sleep(5 * time.Second)

		// 更新图像状态
		var img db.Image
		id, _ := util.StringToUint64(imageID)
		if err := db.Get().First(&img, id).Error; err == nil {
			img.URL = "https://example.com/images/" + time.Now().Format("20060102150405") + ".png"
			img.Status = "completed"
			db.Get().Save(&img)
		}

		logger.Info("图像生成完成", logger.String("image_id", imageID))
		return nil
	}); err != nil {
		logger.Fatal("启动消息队列消费者失败", logger.Any("error", err))
	}

	// 服务停止时关闭消息队列
	defer func() {
		if err := queue.Stop(); err != nil {
			logger.Error("消息队列关闭失败", logger.Any("error", err))
		}
	}()

	// 初始化服务注册与发现
	if err := registry.InitRegistry(
		false,                   // 开发环境使用内存实现
		cfg.Etcd.Endpoints,
		cfg.Etcd.DialTimeout,
		cfg.Etcd.Username,
		cfg.Etcd.Password,
	); err != nil {
		logger.Fatal("注册中心初始化失败", logger.Any("error", err))
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
		logger.Fatal("服务注册失败", logger.Any("error", err))
	}

	// 服务停止时注销
	defer func() {
		if err := registry.GetRegistry().Unregister(ctx, instance); err != nil {
			logger.Error("服务注销失败", logger.Any("error", err))
		}
		logger.Info("Image Service 已停止")
	}()

	logger.Info("Image Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}
