package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/registry"
	"dora-magic-box/kitex_gen/base"
	"dora-magic-box/kitex_gen/model"
	"dora-magic-box/kitex_gen/model/modelservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"github.com/google/uuid"
	"net"

)

// ModelServiceImpl 模型服务实现
type ModelServiceImpl struct{}

// GetModelConfigs 获取模型配置
func (s *ModelServiceImpl) GetModelConfigs(ctx context.Context, req *model.GetModelConfigsReq) (resp *model.GetModelConfigsResp, err error) {
	logger.Info("GetModelConfigs called",
		logger.String("model_type", req.ModelType),
	)

	// 模拟返回模型配置
	var configs []*model.ModelConfig

	configs = append(configs, &model.ModelConfig{
		Id:         uuid.New().String(),
		Name:       "DeepSeek",
		Type:       "text",
		Provider:   "deepseek",
		Endpoint:   "https://api.deepseek.com",
		Params:     map[string]string{"temperature": "0.7", "max_tokens": "2048"},
		Enabled:    true,
	})

	configs = append(configs, &model.ModelConfig{
		Id:         uuid.New().String(),
		Name:       "Gemini 3.1 pro",
		Type:       "text",
		Provider:   "gemini",
		Endpoint:   "https://generativelanguage.googleapis.com",
		Params:     map[string]string{"temperature": "0.7", "max_tokens": "4096"},
		Enabled:    true,
	})

	configs = append(configs, &model.ModelConfig{
		Id:         uuid.New().String(),
		Name:       "Banana 2",
		Type:       "image",
		Provider:   "banana",
		Endpoint:   "https://api.banana.dev",
		Params:     map[string]string{"size": "1024x1024", "steps": "30"},
		Enabled:    true,
	})

	configs = append(configs, &model.ModelConfig{
		Id:         uuid.New().String(),
		Name:       "Seedance",
		Type:       "video",
		Provider:   "seedance",
		Endpoint:   "https://api.seedance.ai",
		Params:     map[string]string{"resolution": "720p", "fps": "24"},
		Enabled:    true,
	})

	// 如果指定了模型类型，过滤返回
	if req.ModelType != "" {
		var filtered []*model.ModelConfig
		for _, cfg := range configs {
			if cfg.Type == req.ModelType {
				filtered = append(filtered, cfg)
			}
		}
		configs = filtered
	}

	return &model.GetModelConfigsResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: configs,
	}, nil
}

// UpdateModelConfig 更新模型配置
func (s *ModelServiceImpl) UpdateModelConfig(ctx context.Context, req *model.UpdateModelConfigReq) (resp *model.UpdateModelConfigResp, err error) {
	logger.Info("UpdateModelConfig called",
		logger.String("id", req.Id),
	)

	// TODO: 实际更新数据库中的模型配置

	return &model.UpdateModelConfigResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
	}, nil
}

// CallTextModel 调用文本模型
func (s *ModelServiceImpl) CallTextModel(ctx context.Context, req *model.CallTextModelReq) (resp *model.CallTextModelResp, err error) {
	logger.Info("CallTextModel called",
		logger.String("prompt", req.Prompt),
		logger.String("model_id", req.ModelId),
	)

	// 模拟调用文本模型（DeepSeek 或 Gemini 3.1 pro）
	var provider string
	if req.ModelId != "" {
		// 根据模型ID选择提供者
		provider = "gemini"
	} else {
		provider = "deepseek" // 默认使用 DeepSeek
	}

	logger.Info("调用文本模型",
		logger.String("provider", provider),
	)

	// 模拟AI模型响应
	result := "这是" + provider + "模型的响应：" + req.Prompt

	return &model.CallTextModelResp{
		Base:   &base.BaseResp{Code: 0, Msg: "success"},
		Result: result,
	}, nil
}

// CallImageModel 调用图片模型
func (s *ModelServiceImpl) CallImageModel(ctx context.Context, req *model.CallImageModelReq) (resp *model.CallImageModelResp, err error) {
	logger.Info("CallImageModel called",
		logger.String("prompt", req.Prompt),
		logger.String("model_id", req.ModelId),
	)

	// 模拟调用图片模型（Banana 2）
	logger.Info("调用图片模型",
		logger.String("provider", "banana"),
	)

	return &model.CallImageModelResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		ImageUrl: "https://example.com/images/" + uuid.New().String() + ".png",
	}, nil
}

// CallVideoModel 调用视频模型
func (s *ModelServiceImpl) CallVideoModel(ctx context.Context, req *model.CallVideoModelReq) (resp *model.CallVideoModelResp, err error) {
	logger.Info("CallVideoModel called",
		logger.Int("image_count", len(req.ImageUrls)),
		logger.String("model_id", req.ModelId),
	)

	// 模拟调用视频模型（Seedance）
	logger.Info("调用视频模型",
		logger.String("provider", "seedance"),
	)

	return &model.CallVideoModelResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		VideoUrl: "https://example.com/videos/" + uuid.New().String() + ".mp4",
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
	svr := modelservice.NewServer(new(ModelServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
			ServiceName: "model-service",
		}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "model-service",
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
		logger.Info("Model Service 已停止")
	}()

	logger.Info("Model Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}
