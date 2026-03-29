package main

import (
	"context"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"github.com/cloudwego/kitex/pkg/endpoint"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/pkg/transmeta"
	"github.com/cloudwego/kitex/server"
	"github.com/kitex-contrib/obs-opentelemetry/tracing"
)

// 假设生成的代码路径
// import "github.com/dora-magic-box/idl/kitex_gen/script/scriptservice"

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

	// 创建服务
	// svr := scriptservice.NewServer(new(ScriptServiceImpl),
	// 	server.WithMiddleware(middleware.CommonMiddleware),
	// 	server.WithMiddleware(middleware.ServerMiddleware),
	// 	server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
	// 		ServiceName: "script-service",
	// 	}),
	// 	server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	// )

	// svr.Run()

	logger.Info("Script Service 启动",
		logger.GetLogger().String("host", cfg.Server.Host),
		logger.GetLogger().Int("port", cfg.Server.Port),
	)
}

// ScriptServiceImpl 剧本服务实现
type ScriptServiceImpl struct{}

// GenerateScript 生成剧本
// func (s *ScriptServiceImpl) GenerateScript(ctx context.Context, req *script.GenerateScriptReq) (resp *script.GenerateScriptResp, err error) {
// 	logger.Info("GenerateScript called",
// 		logger.GetLogger().String("project_id", req.ProjectId),
// 		logger.GetLogger().String("inspiration", req.Inspiration),
// 	)
//
// 	// TODO: 调用文本模型生成剧本
//
// 	return &script.GenerateScriptResp{
// 		Base: &base.BaseResp{
// 			Code: 0,
// 			Msg:  "success",
// 		},
// 		Data: &script.ScriptInfo{
// 			Id:         uuid.New().String(),
// 			ProjectId:  req.ProjectId,
// 			Content:    "生成的剧本内容",
// 			Model:      "deepseek",
// 			Status:     "completed",
// 			CreatedAt:  time.Now().Format(time.RFC3339),
// 		},
// 	}, nil
// }

// GetScript 获取剧本
// func (s *ScriptServiceImpl) GetScript(ctx context.Context, req *script.GetScriptReq) (resp *script.GetScriptResp, err error) {
// 	logger.Info("GetScript called",
// 		logger.GetLogger().String("id", req.Id),
// 	)
//
// 	// TODO: 从数据库获取剧本
//
// 	return &script.GetScriptResp{
// 		Base: &base.BaseResp{
// 			Code: 0,
// 			Msg:  "success",
// 		},
// 		Data: &script.ScriptInfo{},
// 	}, nil
// }
