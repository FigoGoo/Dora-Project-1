package main

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"dora-magic-box/internal/pkg/middleware"
	"dora-magic-box/internal/pkg/queue"
	"dora-magic-box/internal/pkg/registry"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
)

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

	// 创建 Hertz 服务器
	h := server.Default(
		server.WithHostPorts(fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)),
	)

	// 注册中间件
	h.Use(middleware.Recovery())
	h.Use(middleware.Cors())
	h.Use(middleware.Logger())

	// 注册路由
	registerRoutes(h)

	// 启动服务前先注册到注册中心
	instance := &registry.ServiceInstance{
		ServiceName: "api-gateway",
		Address:     cfg.Server.Host,
		Port:        cfg.Server.Port,
		Metadata: map[string]string{
			"version": "v1.0.0",
			"type":    "api",
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
		logger.Info("API Gateway 已停止")
	}()

	// 启动服务
	logger.Info("API Gateway 启动",
		logger.String("host", cfg.Server.Host),
		logger.Int("port", cfg.Server.Port),
	)

	h.Spin()
}

func registerRoutes(h *server.Hertz) {
	// 健康检查
	h.GET("/health", func(c context.Context, ctx *app.RequestContext) {
		middleware.Success(ctx, map[string]string{"status": "ok"})
	})

	// API v1
	v1 := h.Group("/api/v1")
	{
		// 项目相关
		v1.POST("/projects", createProject)
		v1.GET("/projects/:id", getProject)
		v1.GET("/projects", listProjects)
		v1.DELETE("/projects/:id", deleteProject)

		// 剧本相关
		v1.POST("/projects/:id/scripts", generateScript)
		v1.GET("/scripts/:id", getScript)

		// 分镜相关
		v1.POST("/scripts/:id/storyboards", splitStoryboard)
		v1.GET("/projects/:id/storyboards", getStoryboards)

		// 画面相关
		v1.POST("/storyboards/:id/images", generateImage)
		v1.GET("/images/:id", getImage)

		// 视频相关
		v1.POST("/storyboards/:id/videos", generateVideo)
		v1.GET("/videos/:id", getVideo)

		// 合并相关
		v1.POST("/projects/:id/merge", mergeVideo)
		v1.GET("/videos/:id/download", downloadVideo)
		v1.POST("/videos/:id/publish", publishVideo)

		// 工作流相关
		v1.POST("/workflow", createWorkflow)
		v1.GET("/workflow/:id", getWorkflow)
		v1.GET("/workflow/project/:project_id", getWorkflowByProject)
		v1.POST("/workflow/:id/start", startWorkflow)
		v1.GET("/workflow/list", listWorkflows)
	}
}

// createProject 创建项目
func createProject(c context.Context, ctx *app.RequestContext) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		UserID      uint64 `json:"user_id"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	project := &db.Project{
		UserID:      req.UserID,
		Title:       req.Name,
		Description: req.Description,
		Status:      "pending",
		Duration:    60,
	}

	if err := db.Get().Create(project).Error; err != nil {
		logger.Error("创建项目失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "创建项目失败")
		return
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": project.ID,
	})
}

// getProject 获取项目
func getProject(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	var project db.Project
	if err := db.Get().First(&project, id).Error; err != nil {
		logger.Error("获取项目失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "项目不存在")
		return
	}

	middleware.Success(ctx, project)
}

// listProjects 列出项目
func listProjects(c context.Context, ctx *app.RequestContext) {
	userIDStr := ctx.Query("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的用户ID")
		return
	}

	var projects []db.Project
	if err := db.Get().Where("user_id = ?", userID).Order("created_at DESC").Find(&projects).Error; err != nil {
		logger.Error("获取项目列表失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "获取项目列表失败")
		return
	}

	middleware.Success(ctx, map[string]interface{}{
		"items": projects,
		"count": len(projects),
	})
}

// deleteProject 删除项目
func deleteProject(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	if err := db.Get().Delete(&db.Project{}, id).Error; err != nil {
		logger.Error("删除项目失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "删除项目失败")
		return
	}

	middleware.Success(ctx, nil)
}

// generateScript 生成剧本
func generateScript(c context.Context, ctx *app.RequestContext) {
	projectIDStr := ctx.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	var req struct {
		Description string `json:"description"`
		Model       string `json:"model"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	// 保存剧本
	script := &db.Script{
		ProjectID: projectID,
		Content:   "", // 剧本内容稍后生成
		Model:     req.Model,
		Status:    "pending",
	}

	if err := db.Get().Create(script).Error; err != nil {
		logger.Error("保存剧本失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "保存剧本失败")
		return
	}

	// 发送消息到队列，异步生成剧本
	message := queue.GenerateScriptMessage(map[string]interface{}{
		"project_id":  projectID,
		"script_id":   script.ID,
		"description": req.Description,
		"model":       req.Model,
	})

	if err := queue.SendMessage("script", message); err != nil {
		logger.Error("发送剧本生成消息失败", logger.Any("error", err))
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": script.ID,
	})
}

// getScript 获取剧本
func getScript(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的剧本ID")
		return
	}

	var script db.Script
	if err := db.Get().First(&script, id).Error; err != nil {
		logger.Error("获取剧本失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "剧本不存在")
		return
	}

	middleware.Success(ctx, script)
}

// splitStoryboard 分镜拆分
func splitStoryboard(c context.Context, ctx *app.RequestContext) {
	scriptIDStr := ctx.Param("id")
	scriptID, err := strconv.ParseUint(scriptIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的剧本ID")
		return
	}

	var req struct {
		Segments int `json:"segments"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	// 获取剧本
	var script db.Script
	if err := db.Get().First(&script, scriptID).Error; err != nil {
		logger.Error("获取剧本失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "剧本不存在")
		return
	}

	// 发送消息到队列，异步拆分分镜
	message := queue.SplitStoryboardMessage(map[string]interface{}{
		"script_id": scriptID,
		"content":   script.Content,
		"segments":  req.Segments,
	})

	if err := queue.SendMessage("storyboard", message); err != nil {
		logger.Error("发送分镜拆分消息失败", logger.Any("error", err))
	}

	middleware.Success(ctx, map[string]interface{}{
		"script_id": scriptID,
	})
}

// getStoryboards 获取分镜列表
func getStoryboards(c context.Context, ctx *app.RequestContext) {
	projectIDStr := ctx.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	var storyboards []db.Storyboard
	if err := db.Get().Where("project_id = ?", projectID).Order("sequence").Find(&storyboards).Error; err != nil {
		logger.Error("获取分镜列表失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "获取分镜列表失败")
		return
	}

	middleware.Success(ctx, map[string]interface{}{
		"items": storyboards,
		"count": len(storyboards),
	})
}

// generateImage 生成图像
func generateImage(c context.Context, ctx *app.RequestContext) {
	storyboardIDStr := ctx.Param("id")
	storyboardID, err := strconv.ParseUint(storyboardIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的分镜ID")
		return
	}

	var req struct {
		Prompt string `json:"prompt"`
		Model  string `json:"model"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	// 获取分镜信息
	var storyboard db.Storyboard
	if err := db.Get().First(&storyboard, storyboardID).Error; err != nil {
		logger.Error("获取分镜失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "分镜不存在")
		return
	}

	// 保存图像任务
	image := &db.Image{
		StoryboardID: storyboardID,
		URL:          "",
		Prompt:       req.Prompt,
		Model:        req.Model,
		Status:       "pending",
	}

	if err := db.Get().Create(image).Error; err != nil {
		logger.Error("保存图像任务失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "保存图像任务失败")
		return
	}

	// 发送消息到队列，异步生成图像
	message := queue.GenerateImageMessage(map[string]interface{}{
		"image_id":      image.ID,
		"project_id":    storyboard.ProjectID,
		"storyboard_id": storyboardID,
		"prompt":        req.Prompt,
		"model":         req.Model,
	})

	if err := queue.SendMessage("image", message); err != nil {
		logger.Error("发送图像生成消息失败", logger.Any("error", err))
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": image.ID,
	})
}

// getImage 获取图像
func getImage(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的图像ID")
		return
	}

	var image db.Image
	if err := db.Get().First(&image, id).Error; err != nil {
		logger.Error("获取图像失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "图像不存在")
		return
	}

	middleware.Success(ctx, image)
}

// generateVideo 生成视频
func generateVideo(c context.Context, ctx *app.RequestContext) {
	storyboardIDStr := ctx.Param("id")
	storyboardID, err := strconv.ParseUint(storyboardIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的分镜ID")
		return
	}

	var req struct {
		Images []string `json:"images"`
		Model  string   `json:"model"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	// 获取分镜信息
	var storyboard db.Storyboard
	if err := db.Get().First(&storyboard, storyboardID).Error; err != nil {
		logger.Error("获取分镜失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "分镜不存在")
		return
	}

	imagesJSON, err := json.Marshal(req.Images)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "图像信息格式错误")
		return
	}

	// 保存视频任务
	video := &db.Video{
		StoryboardID: storyboardID,
		URL:          "",
		ImageURLs:    string(imagesJSON),
		Model:        req.Model,
		Duration:     storyboard.Duration,
		Status:       "pending",
	}

	if err := db.Get().Create(video).Error; err != nil {
		logger.Error("保存视频任务失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "保存视频任务失败")
		return
	}

	// 发送消息到队列，异步生成视频
	message := queue.GenerateVideoMessage(map[string]interface{}{
		"video_id":      video.ID,
		"project_id":    storyboard.ProjectID,
		"storyboard_id": storyboardID,
		"images":        req.Images,
		"model":         req.Model,
	})

	if err := queue.SendMessage("video", message); err != nil {
		logger.Error("发送视频生成消息失败", logger.Any("error", err))
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": video.ID,
	})
}

// getVideo 获取视频
func getVideo(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的视频ID")
		return
	}

	var video db.Video
	if err := db.Get().First(&video, id).Error; err != nil {
		logger.Error("获取视频失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "视频不存在")
		return
	}

	middleware.Success(ctx, video)
}

// mergeVideo 合并视频
func mergeVideo(c context.Context, ctx *app.RequestContext) {
	projectIDStr := ctx.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	var req struct {
		VideoIDs []uint64 `json:"video_ids"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	// 保存合并视频任务
	mergedVideo := &db.MergedVideo{
		ProjectID:   projectID,
		URL:         "",
		SegmentURLs: "", // 视频段落URL稍后保存
		Duration:    0,  // 总时长稍后计算
		Status:      "pending",
	}

	if err := db.Get().Create(mergedVideo).Error; err != nil {
		logger.Error("保存合并视频任务失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "保存合并视频任务失败")
		return
	}

	// 发送消息到队列，异步合并视频
	message := queue.MergeVideoMessage(map[string]interface{}{
		"merged_video_id": mergedVideo.ID,
		"project_id":      projectID,
		"video_ids":       req.VideoIDs,
	})

	if err := queue.SendMessage("merge", message); err != nil {
		logger.Error("发送视频合并消息失败", logger.Any("error", err))
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": mergedVideo.ID,
	})
}

// downloadVideo 下载视频
func downloadVideo(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的视频ID")
		return
	}

	var mergedVideo db.MergedVideo
	if err := db.Get().First(&mergedVideo, id).Error; err != nil {
		logger.Error("获取视频失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "视频不存在")
		return
	}

	middleware.Success(ctx, map[string]interface{}{
		"url": mergedVideo.URL,
	})
}

// publishVideo 发布视频
func publishVideo(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的视频ID")
		return
	}

	var req struct {
		Platform string `json:"platform"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	var mergedVideo db.MergedVideo
	if err := db.Get().First(&mergedVideo, id).Error; err != nil {
		logger.Error("获取视频失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "视频不存在")
		return
	}

	// 发送消息到队列，异步发布视频
	message := queue.PublishVideoMessage(map[string]interface{}{
		"merged_video_id": id,
		"project_id":      mergedVideo.ProjectID,
		"platform":        req.Platform,
		"url":             mergedVideo.URL,
	})

	if err := queue.SendMessage("publish", message); err != nil {
		logger.Error("发送视频发布消息失败", logger.Any("error", err))
	}

	// 更新项目状态为已完成
	if err := db.Get().Model(&db.Project{}).Where("id = ?", mergedVideo.ProjectID).Update("status", "completed").Error; err != nil {
		logger.Error("更新项目状态失败", logger.Any("error", err))
	}

	middleware.Success(ctx, nil)
}

// createWorkflow 创建工作流
func createWorkflow(c context.Context, ctx *app.RequestContext) {
	var req struct {
		ProjectId   string `json:"project_id"`
		Inspiration string `json:"inspiration"`
		Model       string `json:"model,omitempty"`
	}

	if err := ctx.Bind(&req); err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "参数错误")
		return
	}

	projectID, err := strconv.ParseUint(req.ProjectId, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	// 初始化工作流步骤状态
	stepStatus := map[string]string{
		"script":     "pending",
		"storyboard": "pending",
		"image":      "pending",
		"video":      "pending",
		"merge":      "pending",
	}

	stepStatusJSON, err := json.Marshal(stepStatus)
	if err != nil {
		logger.Error("步骤状态序列化失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "工作流创建失败")
		return
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

	if err := db.Get().Create(workflowModel).Error; err != nil {
		logger.Error("创建工作流失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "创建工作流失败")
		return
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": workflowModel.ID,
	})
}

// getWorkflow 获取工作流
func getWorkflow(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的工作流ID")
		return
	}

	var workflowModel db.Workflow
	if err := db.Get().First(&workflowModel, id).Error; err != nil {
		logger.Error("获取工作流失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "工作流不存在")
		return
	}

	// 转换步骤状态
	var stepStatusMap map[string]string
	_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

	middleware.Success(ctx, map[string]interface{}{
		"id":           workflowModel.ID,
		"project_id":   workflowModel.ProjectID,
		"status":       workflowModel.Status,
		"current_step": workflowModel.CurrentStep,
		"total_steps":  workflowModel.TotalSteps,
		"progress":     workflowModel.Progress,
		"step_status":  stepStatusMap,
		"created_at":   workflowModel.CreatedAt,
		"updated_at":   workflowModel.UpdatedAt,
	})
}

// getWorkflowByProject 根据项目ID获取工作流
func getWorkflowByProject(c context.Context, ctx *app.RequestContext) {
	projectIDStr := ctx.Param("project_id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的项目ID")
		return
	}

	var workflowModel db.Workflow
	if err := db.Get().Where("project_id = ?", projectID).First(&workflowModel).Error; err != nil {
		logger.Error("获取工作流失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "工作流不存在")
		return
	}

	// 转换步骤状态
	var stepStatusMap map[string]string
	_ = json.Unmarshal([]byte(workflowModel.StepStatus), &stepStatusMap)

	middleware.Success(ctx, map[string]interface{}{
		"id":           workflowModel.ID,
		"project_id":   workflowModel.ProjectID,
		"status":       workflowModel.Status,
		"current_step": workflowModel.CurrentStep,
		"total_steps":  workflowModel.TotalSteps,
		"progress":     workflowModel.Progress,
		"step_status":  stepStatusMap,
		"created_at":   workflowModel.CreatedAt,
		"updated_at":   workflowModel.UpdatedAt,
	})
}

// startWorkflow 启动工作流
func startWorkflow(c context.Context, ctx *app.RequestContext) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		middleware.Error(ctx, middleware.CodeBadRequest, "无效的工作流ID")
		return
	}

	var workflowModel db.Workflow
	if err := db.Get().First(&workflowModel, id).Error; err != nil {
		logger.Error("获取工作流失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeNotFound, "工作流不存在")
		return
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

	stepStatusJSON, _ := json.Marshal(stepStatus)
	workflowModel.StepStatus = string(stepStatusJSON)

	if err := db.Get().Save(&workflowModel).Error; err != nil {
		logger.Error("更新工作流失败", logger.Any("error", err))
		middleware.Error(ctx, middleware.CodeInternalServerError, "更新工作流失败")
		return
	}

	// 发送工作流启动消息到消息队列
	err = queue.SendMessage("workflow", queue.GenerateWorkflowMessage(map[string]interface{}{
		"workflow_id": id,
		"project_id":  workflowModel.ProjectID,
		"step":        "script",
	}))
	if err != nil {
		logger.Error("发送工作流消息失败", logger.Any("error", err))
	}

	middleware.Success(ctx, map[string]interface{}{
		"id": workflowModel.ID,
	})
}

// listWorkflows 获取工作流列表
func listWorkflows(c context.Context, ctx *app.RequestContext) {
	pageStr := ctx.Query("page")
	pageSizeStr := ctx.Query("page_size")

	page := 1
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	pageSize := 10
	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	// 查询工作流列表
	var workflowModels []db.Workflow
	var total int64

	offset := (page - 1) * pageSize
	db.Get().Model(&db.Workflow{}).Count(&total)
	db.Get().Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&workflowModels)

	// 转换为响应格式
	var workflows []map[string]interface{}
	for _, wf := range workflowModels {
		var stepStatusMap map[string]string
		_ = json.Unmarshal([]byte(wf.StepStatus), &stepStatusMap)

		workflows = append(workflows, map[string]interface{}{
			"id":           wf.ID,
			"project_id":   wf.ProjectID,
			"status":       wf.Status,
			"current_step": wf.CurrentStep,
			"total_steps":  wf.TotalSteps,
			"progress":     wf.Progress,
			"step_status":  stepStatusMap,
			"created_at":   wf.CreatedAt,
			"updated_at":   wf.UpdatedAt,
		})
	}

	// 计算分页信息
	totalPages := (int(total) + pageSize - 1) / pageSize

	middleware.Success(ctx, map[string]interface{}{
		"items": workflows,
		"pagination": map[string]interface{}{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}
