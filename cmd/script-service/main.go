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
	"dora-magic-box/kitex_gen/script"
	"dora-magic-box/kitex_gen/script/scriptservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"net"
	"time"
)

// ScriptServiceImpl 剧本服务实现
type ScriptServiceImpl struct{}

// GenerateScript 生成剧本
func (s *ScriptServiceImpl) GenerateScript(ctx context.Context, req *script.GenerateScriptReq) (resp *script.GenerateScriptResp, err error) {
	logger.Info("GenerateScript called",
		logger.String("project_id", req.ProjectId),
		logger.String("inspiration", req.Inspiration),
	)

	projectID, err := util.StringToUint64(req.ProjectId)
	if err != nil {
		logger.Error("无效的项目ID", logger.String("project_id", req.ProjectId), logger.ErrorField(err))
		return &script.GenerateScriptResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的项目ID",
			},
			Data: nil,
		}, nil
	}

	// 创建剧本记录
	scriptModel := &db.Script{
		ProjectID: projectID,
		Content:   "生成的剧本内容：" + req.Inspiration,
		Model:     "deepseek",
		Status:    "completed",
	}

	db.Get().Create(scriptModel)

	return &script.GenerateScriptResp{
		Base: &base.BaseResp{
			Code: 0,
			Msg:  "success",
		},
		Data: &script.ScriptInfo{
			Id:         util.Uint64ToString(scriptModel.ID),
			ProjectId:  req.ProjectId,
			Content:    "生成的剧本内容：" + req.Inspiration,
			Model:      "deepseek",
			Status:     "completed",
			CreatedAt:  util.FormatTimeToString(scriptModel.CreatedAt),
		},
	}, nil
}

// GetScript 获取剧本
func (s *ScriptServiceImpl) GetScript(ctx context.Context, req *script.GetScriptReq) (resp *script.GetScriptResp, err error) {
	logger.Info("GetScript called",
		logger.String("id", req.Id),
	)

	id, err := util.StringToUint64(req.Id)
	if err != nil {
		logger.Error("无效的剧本ID", logger.String("id", req.Id), logger.ErrorField(err))
		return &script.GetScriptResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的剧本ID",
			},
			Data: nil,
		}, nil
	}

	// 查找剧本
	var scriptModel db.Script
	result := db.Get().First(&scriptModel, id)
	if result.Error != nil {
		logger.Warn("剧本未找到", logger.String("id", req.Id), logger.ErrorField(result.Error))
		return &script.GetScriptResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "script not found",
			},
			Data: nil,
		}, nil
	}

	return &script.GetScriptResp{
		Base: &base.BaseResp{
			Code: 0,
			Msg:  "success",
		},
		Data: &script.ScriptInfo{
			Id:         util.Uint64ToString(scriptModel.ID),
			ProjectId:  util.Uint64ToString(scriptModel.ProjectID),
			Content:    scriptModel.Content,
			Model:      scriptModel.Model,
			Status:     scriptModel.Status,
			CreatedAt:  util.FormatTimeToString(scriptModel.CreatedAt),
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

	// 启动剧本生成任务消费者
	if err := queue.StartConsumer("script", func(msg *queue.QueueMessage) error {
		logger.Info("处理剧本生成任务", logger.Any("msg", msg))

		scriptID, ok := msg.Data["script_id"].(uint64)
		if !ok {
			return nil // 忽略无效消息
		}

		description, _ := msg.Data["description"].(string)
		model, _ := msg.Data["model"].(string)

		// 模拟剧本生成
		time.Sleep(3 * time.Second)

		// 更新剧本状态
		var script db.Script
		if err := db.Get().First(&script, scriptID).Error; err == nil {
			script.Content = "生成的剧本内容：" + description
			script.Model = model
			script.Status = "completed"
			db.Get().Save(&script)
		}

		logger.Info("剧本生成完成", logger.Uint64("script_id", scriptID))
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
	svr := scriptservice.NewServer(new(ScriptServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
			ServiceName: "script-service",
		}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "script-service",
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
		logger.Info("Script Service 已停止")
	}()

	logger.Info("Script Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}
