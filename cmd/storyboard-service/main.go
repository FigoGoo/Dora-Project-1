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
	"dora-magic-box/kitex_gen/storyboard"
	"dora-magic-box/kitex_gen/storyboard/storyboardservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"net"
	"strconv"
	"time"
)

// StoryboardServiceImpl 分镜服务实现
type StoryboardServiceImpl struct{}

// SplitStoryboard 拆解分镜
func (s *StoryboardServiceImpl) SplitStoryboard(ctx context.Context, req *storyboard.SplitStoryboardReq) (resp *storyboard.SplitStoryboardResp, err error) {
	logger.Info("SplitStoryboard called",
		logger.String("script_id", req.ScriptId),
	)

	scriptID, err := util.StringToUint64(req.ScriptId)
	if err != nil {
		logger.Error("无效的剧本ID", logger.String("script_id", req.ScriptId), logger.ErrorField(err))
		return &storyboard.SplitStoryboardResp{
			Base: &base.BaseResp{Code: -1, Msg: "无效的剧本ID"},
			Data: nil,
		}, nil
	}

	// 模拟分镜拆解
	var storyboards []*storyboard.StoryboardInfo

	for i := 1; i <= 5; i++ {
		seq := int32(i)
		storyboards = append(storyboards, &storyboard.StoryboardInfo{
			Id:          "",
			ProjectId:   "",
			ScriptId:    req.ScriptId,
			Sequence:    seq,
			Description: "第" + strconv.Itoa(i) + "个镜头描述",
			Prompt:      "第" + strconv.Itoa(i) + "个镜头提示词",
			Duration:    3,
			Status:      "completed",
		})
	}

	// 保存分镜记录到数据库
	var savedStoryboards []*storyboard.StoryboardInfo
	for _, sb := range storyboards {
		storyboardModel := &db.Storyboard{
			ScriptID:    scriptID,
			Sequence:    util.Int32ToInt(sb.Sequence),
			Description: sb.Description,
			Prompt:      sb.Prompt,
			Duration:    util.Int32ToInt(sb.Duration),
			Status:      sb.Status,
		}
		db.Get().Create(storyboardModel)

		// 更新ID为数据库生成的ID
		sb.Id = util.Uint64ToString(storyboardModel.ID)
		savedStoryboards = append(savedStoryboards, sb)
	}

	return &storyboard.SplitStoryboardResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: savedStoryboards,
	}, nil
}

// GetStoryboards 获取分镜列表
func (s *StoryboardServiceImpl) GetStoryboards(ctx context.Context, req *storyboard.GetStoryboardsReq) (resp *storyboard.GetStoryboardsResp, err error) {
	logger.Info("GetStoryboards called",
		logger.String("project_id", req.ProjectId),
	)

	projectID, err := util.StringToUint64(req.ProjectId)
	if err != nil {
		logger.Error("无效的项目ID", logger.String("project_id", req.ProjectId), logger.ErrorField(err))
		return &storyboard.GetStoryboardsResp{
			Base: &base.BaseResp{Code: -1, Msg: "无效的项目ID"},
			Data: nil,
		}, nil
	}

	// 从数据库获取分镜列表
	var storyboardModels []db.Storyboard
	db.Get().Where("project_id = ?", projectID).Order("sequence").Find(&storyboardModels)

	// 转换为响应格式
	var storyboards []*storyboard.StoryboardInfo
	for _, sb := range storyboardModels {
		storyboards = append(storyboards, &storyboard.StoryboardInfo{
			Id:          util.Uint64ToString(sb.ID),
			ProjectId:   req.ProjectId,
			ScriptId:    util.Uint64ToString(sb.ScriptID),
			Sequence:    util.IntToInt32(sb.Sequence),
			Description: sb.Description,
			Prompt:      sb.Prompt,
			Duration:    util.IntToInt32(sb.Duration),
			Status:      sb.Status,
		})
	}

	// 如果数据库没有记录，返回示例数据
	if len(storyboards) == 0 {
		for i := 1; i <= 3; i++ {
			storyboards = append(storyboards, &storyboard.StoryboardInfo{
				Id:          "",
				ProjectId:   req.ProjectId,
				ScriptId:    "1",
				Sequence:    int32(i),
				Description: "第" + strconv.Itoa(i) + "个镜头描述",
				Prompt:      "第" + strconv.Itoa(i) + "个镜头提示词",
				Duration:    3,
				Status:      "completed",
			})
		}
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
		logger.Fatal("数据库初始化失败", logger.Any("error", err))
	}

	cfg := config.MustGet()

	// 初始化消息队列
	if err := queue.Init(&cfg.RocketMQ); err != nil {
		logger.Fatal("消息队列初始化失败", logger.Any("error", err))
	}

	// 启动分镜拆分任务消费者
	if err := queue.StartConsumer("storyboard", func(msg *queue.QueueMessage) error {
		logger.Info("处理分镜拆分任务", logger.Any("msg", msg))

		scriptID, ok := msg.Data["script_id"].(uint64)
		if !ok {
			return nil // 忽略无效消息
		}

		segments, _ := msg.Data["segments"].(int)

		// 模拟分镜拆分
		time.Sleep(4 * time.Second)

		// 在这里应该根据剧本内容和段落数生成分镜
		// 为了简化，我们假设已经获取到了projectID
		projectID := uint64(1) // 实际应该从剧本中获取

		for i := 1; i <= segments; i++ {
			storyboardModel := &db.Storyboard{
				ProjectID:   projectID,
				ScriptID:    scriptID,
				Sequence:    i,
				Description: "第" + strconv.Itoa(i) + "个镜头描述",
				Prompt:      "第" + strconv.Itoa(i) + "个镜头提示词",
				Duration:    3,
				Status:      "completed",
			}
			db.Get().Create(storyboardModel)
		}

		logger.Info("分镜拆分完成", logger.Uint64("script_id", scriptID))
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
		logger.Fatal("服务注册失败", logger.Any("error", err))
	}

	// 服务停止时注销
	defer func() {
		if err := registry.GetRegistry().Unregister(ctx, instance); err != nil {
			logger.Error("服务注销失败", logger.Any("error", err))
		}
		logger.Info("Storyboard Service 已停止")
	}()

	logger.Info("Storyboard Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}
