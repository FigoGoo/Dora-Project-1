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
	"dora-magic-box/kitex_gen/workflow"
	"dora-magic-box/kitex_gen/workflow/workflowservice"
	"github.com/cloudwego/kitex/pkg/rpcinfo"
	"github.com/cloudwego/kitex/server"
	"net"
	"time"
)

// WorkflowServiceImpl 工作流服务实现
type WorkflowServiceImpl struct{}

// CreateWorkflow 创建工作流
func (s *WorkflowServiceImpl) CreateWorkflow(ctx context.Context, req *workflow.CreateWorkflowReq) (resp *workflow.CreateWorkflowResp, err error) {
	logger.Info("CreateWorkflow called",
		logger.String("project_id", req.ProjectId),
		logger.String("inspiration", req.Inspiration),
	)

	projectID, err := util.StringToUint64(req.ProjectId)
	if err != nil {
		logger.Error("无效的项目ID", logger.String("project_id", req.ProjectId), logger.ErrorField(err))
		return &workflow.CreateWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的项目ID",
			},
			Data: nil,
		}, nil
	}

	// 初始化工作流步骤状态
	stepStatus := map[string]string{
		"script":      "pending",
		"storyboard":  "pending",
		"image":       "pending",
		"video":       "pending",
		"merge":       "pending",
	}

	stepStatusJSON, err := json.Marshal(stepStatus)
	if err != nil {
		logger.Error("步骤状态序列化失败", logger.ErrorField(err))
		return &workflow.CreateWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "工作流创建失败",
			},
			Data: nil,
		}, nil
	}

	// 创建工作流记录
	workflowModel := &db.Workflow{
		ProjectID:   projectID,
		Status:      "pending",
		CurrentStep: "init",
		TotalSteps:  5,
		Progress:    0,
		StepStatus:  string(stepStatusJSON),
	}

	db.Get().Create(workflowModel)

	// 转换为响应格式
	stepStatusMap := make(map[string]string)
	_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

	return &workflow.CreateWorkflowResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &workflow.WorkflowInfo{
			Id:          util.Uint64ToString(workflowModel.ID),
			ProjectId:   req.ProjectId,
			Status:      workflowModel.Status,
			CurrentStep: workflowModel.CurrentStep,
			TotalSteps:  int32(workflowModel.TotalSteps),
			Progress:    int32(workflowModel.Progress),
			StepStatus:  stepStatusMap,
			CreatedAt:   util.FormatTimeToString(workflowModel.CreatedAt),
			UpdatedAt:   util.FormatTimeToString(workflowModel.UpdatedAt),
		},
	}, nil
}

// GetWorkflow 获取工作流
func (s *WorkflowServiceImpl) GetWorkflow(ctx context.Context, req *workflow.GetWorkflowReq) (resp *workflow.GetWorkflowResp, err error) {
	logger.Info("GetWorkflow called",
		logger.String("id", req.Id),
	)

	id, err := util.StringToUint64(req.Id)
	if err != nil {
		logger.Error("无效的工作流ID", logger.String("id", req.Id), logger.ErrorField(err))
		return &workflow.GetWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的工作流ID",
			},
			Data: nil,
		}, nil
	}

	// 查找工作流
	var workflowModel db.Workflow
	result := db.Get().First(&workflowModel, id)
	if result.Error != nil {
		logger.Warn("工作流未找到", logger.String("id", req.Id), logger.ErrorField(result.Error))
		return &workflow.GetWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "workflow not found",
			},
			Data: nil,
		}, nil
	}

	// 转换为响应格式
	stepStatusMap := make(map[string]string)
	_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

	return &workflow.GetWorkflowResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &workflow.WorkflowInfo{
			Id:          util.Uint64ToString(workflowModel.ID),
			ProjectId:   util.Uint64ToString(workflowModel.ProjectID),
			Status:      workflowModel.Status,
			CurrentStep: workflowModel.CurrentStep,
			TotalSteps:  int32(workflowModel.TotalSteps),
			Progress:    int32(workflowModel.Progress),
			StepStatus:  stepStatusMap,
			CreatedAt:   util.FormatTimeToString(workflowModel.CreatedAt),
			UpdatedAt:   util.FormatTimeToString(workflowModel.UpdatedAt),
		},
	}, nil
}

// GetWorkflowByProject 根据项目ID获取工作流
func (s *WorkflowServiceImpl) GetWorkflowByProject(ctx context.Context, req *workflow.GetWorkflowByProjectReq) (resp *workflow.GetWorkflowByProjectResp, err error) {
	logger.Info("GetWorkflowByProject called",
		logger.String("project_id", req.ProjectId),
	)

	projectID, err := util.StringToUint64(req.ProjectId)
	if err != nil {
		logger.Error("无效的项目ID", logger.String("project_id", req.ProjectId), logger.ErrorField(err))
		return &workflow.GetWorkflowByProjectResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的项目ID",
			},
			Data: nil,
		}, nil
	}

	// 查找工作流
	var workflowModel db.Workflow
	result := db.Get().Where("project_id = ?", projectID).First(&workflowModel)
	if result.Error != nil {
		logger.Warn("工作流未找到", logger.String("project_id", req.ProjectId), logger.ErrorField(result.Error))
		return &workflow.GetWorkflowByProjectResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "workflow not found",
			},
			Data: nil,
		}, nil
	}

	// 转换为响应格式
	stepStatusMap := make(map[string]string)
	_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

	return &workflow.GetWorkflowByProjectResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &workflow.WorkflowInfo{
			Id:          util.Uint64ToString(workflowModel.ID),
			ProjectId:   req.ProjectId,
			Status:      workflowModel.Status,
			CurrentStep: workflowModel.CurrentStep,
			TotalSteps:  int32(workflowModel.TotalSteps),
			Progress:    int32(workflowModel.Progress),
			StepStatus:  stepStatusMap,
			CreatedAt:   util.FormatTimeToString(workflowModel.CreatedAt),
			UpdatedAt:   util.FormatTimeToString(workflowModel.UpdatedAt),
		},
	}, nil
}

// StartWorkflow 启动工作流
func (s *WorkflowServiceImpl) StartWorkflow(ctx context.Context, req *workflow.StartWorkflowReq) (resp *workflow.StartWorkflowResp, err error) {
	logger.Info("StartWorkflow called",
		logger.String("id", req.Id),
	)

	id, err := util.StringToUint64(req.Id)
	if err != nil {
		logger.Error("无效的工作流ID", logger.String("id", req.Id), logger.ErrorField(err))
		return &workflow.StartWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "无效的工作流ID",
			},
			Data: nil,
		}, nil
	}

	// 查找工作流
	var workflowModel db.Workflow
	result := db.Get().First(&workflowModel, id)
	if result.Error != nil {
		logger.Warn("工作流未找到", logger.String("id", req.Id), logger.ErrorField(result.Error))
		return &workflow.StartWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "workflow not found",
			},
			Data: nil,
		}, nil
	}

	// 更新工作流状态为运行中
	workflowModel.Status = "running"
	workflowModel.CurrentStep = "script"
	workflowModel.Progress = 0

	// 初始化步骤状态
	stepStatus := map[string]string{
		"script":     "running",
		"storyboard": "pending",
		"image":      "pending",
		"video":      "pending",
		"merge":      "pending",
	}

	stepStatusJSON, err := json.Marshal(stepStatus)
	if err != nil {
		logger.Error("步骤状态序列化失败", logger.ErrorField(err))
		return &workflow.StartWorkflowResp{
			Base: &base.BaseResp{
				Code: -1,
				Msg:  "工作流启动失败",
			},
			Data: nil,
		}, nil
	}
	workflowModel.StepStatus = string(stepStatusJSON)
	db.Get().Save(&workflowModel)

	// 发送工作流启动消息到消息队列
	err = queue.SendMessage("workflow", queue.GenerateWorkflowMessage(map[string]interface{}{
		"workflow_id": id,
		"project_id":  workflowModel.ProjectID,
		"step":        "script",
	}))
	if err != nil {
		logger.Error("发送工作流消息失败", logger.ErrorField(err))
	}

	// 转换为响应格式
	stepStatusMap := make(map[string]string)
	_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

	return &workflow.StartWorkflowResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Data: &workflow.WorkflowInfo{
			Id:          util.Uint64ToString(workflowModel.ID),
			ProjectId:   util.Uint64ToString(workflowModel.ProjectID),
			Status:      workflowModel.Status,
			CurrentStep: workflowModel.CurrentStep,
			TotalSteps:  int32(workflowModel.TotalSteps),
			Progress:    int32(workflowModel.Progress),
			StepStatus:  stepStatusMap,
			CreatedAt:   util.FormatTimeToString(workflowModel.CreatedAt),
			UpdatedAt:   util.FormatTimeToString(workflowModel.UpdatedAt),
		},
	}, nil
}

// GetWorkflowList 获取工作流列表
func (s *WorkflowServiceImpl) GetWorkflowList(ctx context.Context, req *workflow.GetWorkflowListReq) (resp *workflow.GetWorkflowListResp, err error) {
	logger.Info("GetWorkflowList called",
		logger.Int("page", int(req.Page)),
		logger.Int("page_size", int(req.PageSize)),
	)

	page := int(req.Page)
	if page <= 0 {
		page = 1
	}

	pageSize := int(req.PageSize)
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// 查询工作流列表
	var workflowModels []db.Workflow
	var total int64

	offset := (page - 1) * pageSize
	db.Get().Model(&db.Workflow{}).Count(&total)
	db.Get().Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&workflowModels)

	// 转换为响应格式
	var workflows []*workflow.WorkflowInfo
	for _, wf := range workflowModels {
		stepStatusMap := make(map[string]string)
		_ = json.Unmarshal([]byte(wf.StepStatus), &stepStatusMap)

		workflows = append(workflows, &workflow.WorkflowInfo{
			Id:          util.Uint64ToString(wf.ID),
			ProjectId:   util.Uint64ToString(wf.ProjectID),
			Status:      wf.Status,
			CurrentStep: wf.CurrentStep,
			TotalSteps:  int32(wf.TotalSteps),
			Progress:    int32(wf.Progress),
			StepStatus:  stepStatusMap,
			CreatedAt:   util.FormatTimeToString(wf.CreatedAt),
			UpdatedAt:   util.FormatTimeToString(wf.UpdatedAt),
		})
	}

	// 计算分页信息
	return &workflow.GetWorkflowListResp{
		Base: &base.BaseResp{Code: 0, Msg: "success"},
		Pagination: &base.PaginationResp{
			Total:    total,
			Page:     int64(page),
			PageSize: int64(pageSize),
		},
		Data: workflows,
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

	// 启动工作流任务消费者
	if err := queue.StartConsumer("workflow", func(msg *queue.QueueMessage) error {
		logger.Info("处理工作流任务", logger.Any("msg", msg))

		workflowID, ok := msg.Data["workflow_id"].(uint64)
		if !ok {
			return nil // 忽略无效消息
		}

		step, _ := msg.Data["step"].(string)

		// 模拟工作流执行
		switch step {
		case "script":
			logger.Info("执行剧本生成步骤", logger.Uint64("workflow_id", workflowID))
			time.Sleep(3 * time.Second)
			updateWorkflowStep(workflowID, "script", "completed", "storyboard", 20)
		case "storyboard":
			logger.Info("执行分镜拆解步骤", logger.Uint64("workflow_id", workflowID))
			time.Sleep(4 * time.Second)
			updateWorkflowStep(workflowID, "storyboard", "completed", "image", 40)
		case "image":
			logger.Info("执行画面绘制步骤", logger.Uint64("workflow_id", workflowID))
			time.Sleep(8 * time.Second)
			updateWorkflowStep(workflowID, "image", "completed", "video", 60)
		case "video":
			logger.Info("执行视频生成步骤", logger.Uint64("workflow_id", workflowID))
			time.Sleep(6 * time.Second)
			updateWorkflowStep(workflowID, "video", "completed", "merge", 80)
		case "merge":
			logger.Info("执行视频拼接步骤", logger.Uint64("workflow_id", workflowID))
			time.Sleep(5 * time.Second)
			updateWorkflowStep(workflowID, "merge", "completed", "complete", 100)
		case "complete":
			logger.Info("工作流执行完成", logger.Uint64("workflow_id", workflowID))
			// 更新工作流状态为完成
			var workflowModel db.Workflow
			if err := db.Get().First(&workflowModel, workflowID).Error; err == nil {
				workflowModel.Status = "completed"
				workflowModel.CurrentStep = "complete"
				db.Get().Save(&workflowModel)
			}
		}

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
	svr := workflowservice.NewServer(new(WorkflowServiceImpl),
		server.WithServerBasicInfo(&rpcinfo.EndpointBasicInfo{
			ServiceName: "workflow-service",
		}),
		server.WithServiceAddr(&net.TCPAddr{IP: net.ParseIP(cfg.Server.Host), Port: cfg.Server.Port}),
	)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "workflow-service",
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
		logger.Info("Workflow Service 已停止")
	}()

	logger.Info("Workflow Service 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	svr.Run()
}

// updateWorkflowStep 更新工作流步骤状态
func updateWorkflowStep(workflowID uint64, step string, stepStatus string, nextStep string, progress int) {
	var workflowModel db.Workflow
	if err := db.Get().First(&workflowModel, workflowID).Error; err == nil {
		// 更新步骤状态
		var stepStatusMap map[string]string
		_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

		stepStatusMap[step] = stepStatus
		if nextStep != "" {
			stepStatusMap[nextStep] = "running"
		}

		stepStatusJSON, _ := json.Marshal(stepStatusMap)

		workflowModel.StepStatus = string(stepStatusJSON)
		workflowModel.CurrentStep = nextStep
		workflowModel.Progress = progress

		if nextStep == "complete" {
			workflowModel.Status = "completed"
		}

		db.Get().Save(&workflowModel)

		// 发送下一步任务消息
		if nextStep != "" && nextStep != "complete" {
			_ = queue.SendMessage("workflow", queue.GenerateWorkflowMessage(map[string]interface{}{
				"workflow_id": workflowID,
				"project_id":  workflowModel.ProjectID,
				"step":        nextStep,
			}))
		} else if nextStep == "complete" {
			logger.Info("工作流执行完成", logger.Uint64("workflow_id", workflowID))
		}
	}
}
