package main

import (
	"context"
	"encoding/json"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/queue"
	"dora-magic-box/internal/pkg/registry"
	"dora-magic-box/internal/pkg/util"
	"dora-magic-box/kitex_gen/base"
	"dora-magic-box/kitex_gen/video"
	"dora-magic-box/kitex_gen/video/videoservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"net"
	"time"
)

// VideoServiceImpl 视频服务实现
type VideoServiceImpl struct{}

// GenerateVideo 生成视频
func (s *VideoServiceImpl) GenerateVideo(ctx context.Context, req *video.GenerateVideoReq) (resp *video.GenerateVideoResp, err error) {
	logger.Info("GenerateVideo called",
		logger.String("storyboard_id", req.StoryboardId),
		logger.Int("image_count", len(req.ImageUrls)),
	)

	storyboardID, err := util.StringToUint64(req.StoryboardId)
	if err != nil {
		logger.Error("无效的分镜ID", logger.String("storyboard_id", req.StoryboardId), logger.ErrorField(err))
		return &video.GenerateVideoResp{
			Base: &base.BaseResp{Code: -1, Msg: "无效的分镜ID"},
			Data: nil,
		}, nil
	}

	// 创建视频记录
	videoModel := &db.Video{
		StoryboardID: storyboardID,
		URL:          "https://example.com/videos/" + time.Now().Format("20060102150405") + ".mp4",
		ImageURLs:    "[\"" + time.Now().Format("20060102150405") + ".png\"]", // 简单模拟JSON数组
		Model:        "seedance",
		Status:       "completed",
		Duration:     30,
	}

	db.Get().Create(videoModel)

	return &video.GenerateVideoResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &video.VideoInfo{
			Id:            util.Uint64ToString(videoModel.ID),
			StoryboardId:  req.StoryboardId,
			Url:           videoModel.URL,
			ImageUrls:     req.ImageUrls,
			Model:         "seedance",
			Status:        "completed",
			Duration:      int32(videoModel.Duration),
			CreatedAt:     util.FormatTimeToString(videoModel.CreatedAt),
		},
	}, nil
}

// GetVideo 获取视频
func (s *VideoServiceImpl) GetVideo(ctx context.Context, req *video.GetVideoReq) (resp *video.GetVideoResp, err error) {
	logger.Info("GetVideo called",
		logger.String("id", req.Id),
	)

	id, err := util.StringToUint64(req.Id)
	if err != nil {
		logger.Error("无效的视频ID", logger.String("id", req.Id), logger.ErrorField(err))
		return &video.GetVideoResp{
			Base: &base.BaseResp{Code: -1, Msg: "无效的视频ID"},
			Data: nil,
		}, nil
	}

	// 查找视频
	var videoModel db.Video
	result := db.Get().First(&videoModel, id)
	if result.Error != nil {
		logger.Warn("视频未找到", logger.String("id", req.Id), logger.ErrorField(result.Error))
		return &video.GetVideoResp{
			Base: &base.BaseResp{Code: -1, Msg: "video not found"},
			Data: nil,
		}, nil
	}

	return &video.GetVideoResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &video.VideoInfo{
			Id:            req.Id,
			StoryboardId:  util.Uint64ToString(videoModel.StoryboardID),
			Url:           videoModel.URL,
			ImageUrls:     []string{}, // 实际需要从JSON解析
			Model:         videoModel.Model,
			Status:        videoModel.Status,
			Duration:      int32(videoModel.Duration),
			CreatedAt:     util.FormatTimeToString(videoModel.CreatedAt),
		},
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
		logger.Fatal("数据库初始化失败", logger.Any("error", err))
	}

	cfg := config.MustGet()

	// 初始化消息队列
	if err := queue.Init(&cfg.RocketMQ); err != nil {
		logger.Fatal("消息队列初始化失败", logger.Any("error", err))
	}

	// 启动视频生成任务消费者
	if err := queue.StartConsumer("video", func(msg *queue.QueueMessage) error {
		logger.Info("处理视频生成任务", logger.Any("msg", msg))

		videoID, ok := msg.Data["video_id"].(string)
		if !ok {
			return nil // 忽略无效消息
		}

		images, _ := msg.Data["images"].([]string)

		// 模拟视频生成
		time.Sleep(8 * time.Second)

		// 更新视频状态
		var video db.Video
		id, _ := util.StringToUint64(videoID)
		if err := db.Get().First(&video, id).Error; err == nil {
			imagesJSON, _ := json.Marshal(images)
			video.URL = "https://example.com/videos/" + time.Now().Format("20060102150405") + ".mp4"
			video.ImageURLs = string(imagesJSON)
			video.Status = "completed"
			db.Get().Save(&video)
		}

		logger.Info("视频生成完成", logger.String("video_id", videoID))
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

	// 创建服务
	svr := videoservice.NewServer(new(VideoServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{ServiceName: "video-service"}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "video-service",
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
		logger.Info("Video Service 已停止")
	}()

	logger.Info("Video Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}
