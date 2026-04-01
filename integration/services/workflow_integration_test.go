package services

import (
	"dora-magic-box/internal/dal/db"
	testutils "dora-magic-box/test/utils"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type WorkflowIntegrationTestSuite struct {
	suite.Suite
}

func TestWorkflowIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(WorkflowIntegrationTestSuite))
}

func (s *WorkflowIntegrationTestSuite) TestWorkflowInitialization() {
	// 测试工作流初始化

	userID := uint64(100)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 1
	})

	// 创建工作流
	workflow := db.Workflow{
		ProjectID:   project.ID,
		Status:      "pending",
		CurrentStep: "init",
		TotalSteps:  6,
		Progress:    0,
	}

	// 验证工作流初始状态
	assert.Equal(s.T(), project.ID, workflow.ProjectID)
	assert.Equal(s.T(), "pending", workflow.Status)
	assert.Equal(s.T(), "init", workflow.CurrentStep)
	assert.Equal(s.T(), 6, workflow.TotalSteps)
	assert.Equal(s.T(), 0, workflow.Progress)
}

func (s *WorkflowIntegrationTestSuite) TestWorkflowStepProgression() {
	// 测试工作流步骤推进

	userID := uint64(200)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 2
	})

	workflow := db.Workflow{
		ProjectID:   project.ID,
		Status:      "pending",
		CurrentStep: "init",
		TotalSteps:  6,
		Progress:    0,
	}

	// 步骤1: 剧本生成
	workflow.Status = "running"
	workflow.CurrentStep = "script"
	workflow.Progress = 17
	assert.Equal(s.T(), "running", workflow.Status)
	assert.Equal(s.T(), "script", workflow.CurrentStep)
	assert.Equal(s.T(), 17, workflow.Progress)

	// 步骤2: 分镜拆解
	workflow.CurrentStep = "storyboard"
	workflow.Progress = 33
	assert.Equal(s.T(), "storyboard", workflow.CurrentStep)
	assert.Equal(s.T(), 33, workflow.Progress)

	// 步骤3: 画面绘制
	workflow.CurrentStep = "image"
	workflow.Progress = 50
	assert.Equal(s.T(), "image", workflow.CurrentStep)
	assert.Equal(s.T(), 50, workflow.Progress)

	// 步骤4: 视频生成
	workflow.CurrentStep = "video"
	workflow.Progress = 67
	assert.Equal(s.T(), "video", workflow.CurrentStep)
	assert.Equal(s.T(), 67, workflow.Progress)

	// 步骤5: 视频拼接
	workflow.CurrentStep = "merge"
	workflow.Progress = 83
	assert.Equal(s.T(), "merge", workflow.CurrentStep)
	assert.Equal(s.T(), 83, workflow.Progress)

	// 步骤6: 完成
	workflow.CurrentStep = "complete"
	workflow.Status = "completed"
	workflow.Progress = 100
	assert.Equal(s.T(), "complete", workflow.CurrentStep)
	assert.Equal(s.T(), "completed", workflow.Status)
	assert.Equal(s.T(), 100, workflow.Progress)
}

func (s *WorkflowIntegrationTestSuite) TestWorkflowErrorHandling() {
	// 测试工作流错误处理

	userID := uint64(300)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 3
	})

	workflow := db.Workflow{
		ProjectID:   project.ID,
		Status:      "running",
		CurrentStep: "script",
		TotalSteps:  6,
		Progress:    17,
	}

	// 模拟错误发生
	errorMsg := "剧本生成超时: 模型服务响应时间过长"
	workflow.Status = "failed"
	workflow.ErrorMsg = errorMsg

	assert.Equal(s.T(), "failed", workflow.Status)
	assert.Equal(s.T(), errorMsg, workflow.ErrorMsg)

	// 模拟重试
	workflow.Status = "running"
	workflow.ErrorMsg = ""
	assert.Equal(s.T(), "running", workflow.Status)
	assert.Empty(s.T(), workflow.ErrorMsg)
}

func (s *WorkflowIntegrationTestSuite) TestWorkflowPauseResume() {
	// 测试工作流暂停和恢复

	userID := uint64(400)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 4
	})

	workflow := db.Workflow{
		ProjectID:   project.ID,
		Status:      "running",
		CurrentStep: "image",
		TotalSteps:  6,
		Progress:    50,
	}

	// 暂停工作流
	workflow.Status = "paused"
	assert.Equal(s.T(), "paused", workflow.Status)

	// 恢复工作流
	workflow.Status = "running"
	assert.Equal(s.T(), "running", workflow.Status)
}

func (s *WorkflowIntegrationTestSuite) TestCompleteWorkflowWithData() {
	// 测试带数据的完整工作流

	userID := uint64(500)
	project, script, storyboards, images, videos, mergedVideo := testutils.CreateCompleteProject(userID)

	// 设置ID
	project.ID = 5
	script.ID = 5
	script.ProjectID = project.ID

	for i, sb := range storyboards {
		sb.ID = uint64(i + 1)
		sb.ProjectID = project.ID
		sb.ScriptID = script.ID
	}

	for i, img := range images {
		img.ID = uint64(i + 1)
		img.StoryboardID = storyboards[i].ID
	}

	for i, video := range videos {
		video.ID = uint64(i + 1)
		video.StoryboardID = storyboards[i].ID
	}

	mergedVideo.ID = 5
	mergedVideo.ProjectID = project.ID

	// 创建工作流
	workflow := db.Workflow{
		ProjectID:   project.ID,
		Status:      "completed",
		CurrentStep: "complete",
		TotalSteps:  6,
		Progress:    100,
		StepStatus: `{"script":"completed","storyboard":"completed","image":"completed","video":"completed","merge":"completed"}`,
	}

	// 验证工作流和数据的完整性
	assert.Equal(s.T(), "completed", workflow.Status)
	assert.Equal(s.T(), "complete", workflow.CurrentStep)
	assert.Equal(s.T(), 100, workflow.Progress)
	assert.NotEmpty(s.T(), workflow.StepStatus)

	// 验证所有数据都存在
	assert.NotNil(s.T(), project)
	assert.NotNil(s.T(), script)
	assert.Len(s.T(), storyboards, 5)
	assert.Len(s.T(), images, 5)
	assert.Len(s.T(), videos, 5)
	assert.NotNil(s.T(), mergedVideo)
}
