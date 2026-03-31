package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/registry"
	"dora-magic-box/kitex_gen/base"
	"dora-magic-box/kitex_gen/script"
	"dora-magic-box/kitex_gen/script/scriptservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"github.com/google/uuid"
	"net"
	"time"
)

// ScriptServiceImpl 剧本服务实现
type ScriptServiceImpl struct{}

// GenerateScript 生成剧本
func (s *ScriptServiceImpl) GenerateScript(ctx context.Context, req *script.GenerateScriptReq) (resp *script.GenerateScriptResp, err error) {
	logger.Info("GenerateScript called",
		logger.GetLogger().String("project_id", req.ProjectId),
		logger.GetLogger().String("inspiration", req.Inspiration),
	)

	// 创建剧本记录
	scriptModel := &db.Script{
		ProjectID: 1, // 暂时使用固定值，实际应从 req.ProjectId 转换
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
			Id:         uuid.New().String(),
			ProjectId:  req.ProjectId,
			Content:    "生成的剧本内容：" + req.Inspiration,
			Model:      "deepseek",
			Status:     "completed",
			CreatedAt:  time.Now().Format(time.RFC3339),
		},
	}, nil
}

// GetScript 获取剧本
func (s *ScriptServiceImpl) GetScript(ctx context.Context, req *script.GetScriptReq) (resp *script.GetScriptResp, err error) {
	logger.Info("GetScript called",
		logger.GetLogger().String("id", req.Id),
	)

	// 查找剧本
	var scriptModel db.Script
	result := db.Get().First(&scriptModel, req.Id)
	if result.Error != nil {
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
			Id:         req.Id,
			ProjectId:  "1",
			Content:    scriptModel.Content,
			Model:      scriptModel.Model,
			Status:     scriptModel.Status,
			CreatedAt:  scriptModel.CreatedAt.Format(time.RFC3339),
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
		logger.Fatal("服务注册失败", logger.GetLogger().Any("error", err))
	}

	// 服务停止时注销
	defer func() {
		if err := registry.GetRegistry().Unregister(ctx, instance); err != nil {
			logger.Error("服务注销失败", logger.GetLogger().Any("error", err))
		}
		logger.Info("Script Service 已停止")
	}()

	logger.Info("Script Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)

	svr.Run()
}
