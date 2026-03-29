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

	// svr := modelservice.NewServer(new(ModelServiceImpl),
	// 	server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{ServiceName: "model-service"}),
	// 	server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	// )
	// svr.Run()

	logger.Info("Model Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)
}

// ModelServiceImpl 模型服务实现
type ModelServiceImpl struct{}

// GetModelConfigs
// func (s *ModelServiceImpl) GetModelConfigs() (resp *model.GetModelConfigsResp, err error) {
// 	logger.Info("GetModelConfigs called")
// 	return &model.GetModelConfigsResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Data: []*model.ModelConfig{},
// 	}, nil
// }

// UpdateModelConfig
// func (s *ModelServiceImpl) UpdateModelConfig() (resp *model.UpdateModelConfigResp, err error) {
// 	logger.Info("UpdateModelConfig called")
// 	return &model.UpdateModelConfigResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 	}, nil
// }

// CallTextModel
// func (s *ModelServiceImpl) CallTextModel() (resp *model.CallTextModelResp, err error) {
// 	logger.Info("CallTextModel called - DeepSeek 或 Gemini 3.1 pro")
// 	return &model.CallTextModelResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		Result: "",
// 	}, nil
// }

// CallImageModel
// func (s *ModelServiceImpl) CallImageModel() (resp *model.CallImageModelResp, err error) {
// 	logger.Info("CallImageModel called - Banana 2")
// 	return &model.CallImageModelResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		ImageUrl: "",
// 	}, nil
// }

// CallVideoModel
// func (s *ModelServiceImpl) CallVideoModel() (resp *model.CallVideoModelResp, err error) {
// 	logger.Info("CallVideoModel called - Seedance")
// 	return &model.CallVideoModelResp{
// 		Base: &base.BaseResp{Code: 0, Msg: "success"},
// 		VideoUrl: "",
// 	}, nil
// }
