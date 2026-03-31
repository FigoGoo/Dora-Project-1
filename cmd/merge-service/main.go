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
	"dora-magic-box/kitex_gen/merge"
	"dora-magic-box/kitex_gen/merge/mergeservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"github.com/google/uuid"
	"net"
	"time"
)

// MergeServiceImpl 合并服务实现
type MergeServiceImpl struct{}

// MergeVideo 合并视频
func (s *MergeServiceImpl) MergeVideo(ctx context.Context, req *merge.MergeVideoReq) (resp *merge.MergeVideoResp, err error) {
	logger.Info("MergeVideo called",
		logger.String("project_id", req.ProjectId),
		logger.Int("segment_count", len(req.SegmentUrls)),
		logger.Int("transition", int(req.Transition)),
	)

	projectID, err := util.StringToUint64(req.ProjectId)
	if err != nil {
		logger.Error("无效的项目ID", logger.String("project_id", req.ProjectId), logger.ErrorField(err))
		return &merge.MergeVideoResp{
			Base: &base.BaseResp{Code: -1, Msg: "无效的项目ID"},
			Data: nil,
		}, nil
	}

	// 创建合并后的视频记录
	mergedVideoModel := &db.MergedVideo{
		ProjectID:   projectID,
		URL:         "https://example.com/videos/" + time.Now().Format("20060102150405") + "_merged.mp4",
		SegmentURLs: "[\"segment1.mp4\", \"segment2.mp4\"]", // 简单模拟JSON数组
		Status:      "completed",
		Duration:    60,
	}

	db.Get().Create(mergedVideoModel)

	return &merge.MergeVideoResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &merge.MergedVideoInfo{
			Id:         util.Uint64ToString(mergedVideoModel.ID),
			ProjectId:  req.ProjectId,
			Url:        mergedVideoModel.URL,
			SegmentUrls: req.SegmentUrls,
			Duration:   int32(mergedVideoModel.Duration),
			Status:     "completed",
			CreatedAt:  util.FormatTimeToString(mergedVideoModel.CreatedAt),
		},
	}, nil
}

// DownloadVideo 下载视频
func (s *MergeServiceImpl) DownloadVideo(ctx context.Context, req *merge.DownloadVideoReq) (resp *merge.DownloadVideoResp, err error) {
	logger.Info("DownloadVideo called",
		logger.String("id", req.Id),
	)

	// TODO: 实际生成下载链接
	downloadUrl := "https://example.com/download/" + req.Id + ".mp4"

	return &merge.DownloadVideoResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		DownloadUrl: downloadUrl,
	}, nil
}

// PublishVideo 发布视频
func (s *MergeServiceImpl) PublishVideo(ctx context.Context, req *merge.PublishVideoReq) (resp *merge.PublishVideoResp, err error) {
	logger.Info("PublishVideo called",
		logger.String("id", req.Id),
		logger.String("platform", req.Platform),
		logger.String("title", req.Title),
		logger.String("description", req.Description),
	)

	// TODO: 实际发布到各个平台
	var publishedUrl string
	switch req.Platform {
	case "youtube":
		publishedUrl = "https://youtube.com/watch?v=" + uuid.New().String()
	case "bilibili":
		publishedUrl = "https://www.bilibili.com/video/" + uuid.New().String()
	default:
		publishedUrl = "https://example.com/video/" + uuid.New().String()
	}

	return &merge.PublishVideoResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		PublishedUrl: publishedUrl,
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

	// 启动视频合并任务消费者
	if err := queue.StartConsumer("merge", func(msg *queue.QueueMessage) error {
		logger.Info("处理视频合并任务", logger.Any("msg", msg))

		mergedVideoID, ok := msg.Data["merged_video_id"].(uint64)
		if !ok {
			return nil // 忽略无效消息
		}

		videoIDs, _ := msg.Data["video_ids"].([]uint64)

		// 模拟视频合并
		time.Sleep(10 * time.Second)

		// 更新合并视频状态
		var mergedVideo db.MergedVideo
		if err := db.Get().First(&mergedVideo, mergedVideoID).Error; err == nil {
			// 模拟合并后的视频URL
			mergedVideo.URL = "https://example.com/videos/" + time.Now().Format("20060102150405") + "_merged.mp4"
			mergedVideo.Status = "completed"
			// 计算总时长
			var videos []db.Video
			db.Get().Where("id IN ?", videoIDs).Find(&videos)
			var totalDuration int
			for _, v := range videos {
				totalDuration += v.Duration
			}
			mergedVideo.Duration = totalDuration
			db.Get().Save(&mergedVideo)
		}

		logger.Info("视频合并完成", logger.Uint64("merged_video_id", mergedVideoID))
		return nil
	}); err != nil {
		logger.Fatal("启动消息队列消费者失败", logger.Any("error", err))
	}

	// 启动视频发布任务消费者
	if err := queue.StartConsumer("publish", func(msg *queue.QueueMessage) error {
		logger.Info("处理视频发布任务", logger.Any("msg", msg))

		mergedVideoID, ok := msg.Data["merged_video_id"].(uint64)
		if !ok {
			return nil // 忽略无效消息
		}

		platform, _ := msg.Data["platform"].(string)

		// 模拟视频发布
		time.Sleep(5 * time.Second)

		logger.Info("视频发布完成", logger.Uint64("merged_video_id", mergedVideoID), logger.String("platform", platform))
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
	svr := mergeservice.NewServer(new(MergeServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
			ServiceName: "merge-service",
		}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "merge-service",
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
		logger.Info("Merge Service 已停止")
	}()

	logger.Info("Merge Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}
