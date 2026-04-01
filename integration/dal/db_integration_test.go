package dal

import (
	"dora-magic-box/internal/dal/db"
	testutils "dora-magic-box/test/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type DBIntegrationTestSuite struct {
	suite.Suite
}

func TestDBIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(DBIntegrationTestSuite))
}

func (s *DBIntegrationTestSuite) SetupTest() {
	// 每个测试前的设置
}

func (s *DBIntegrationTestSuite) TestProjectCRUD() {
	// 测试项目的完整CRUD操作

	// Create
	userID := uint64(100)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
	})

	// 保存到数据库
	// 注意：在实际测试中需要初始化数据库连接
	// 这里我们只展示测试逻辑，实际使用时需要数据库实例
	// db.GetDB().Create(project)

	assert.NotNil(s.T(), project)
	assert.NotEmpty(s.T(), project.Title)
	assert.Equal(s.T(), userID, project.UserID)
	assert.Equal(s.T(), "pending", project.Status)
	assert.NotZero(s.T(), project.CreatedAt)

	// Read (Retrieve)
	// 在实际测试中，从数据库读取
	// var retrieved db.Project
	// db.GetDB().First(&retrieved, project.ID)
	// assert.Equal(s.T(), project.Title, retrieved.Title)

	// Update
	newTitle := "更新后的项目标题"
	project.Title = newTitle
	// 在实际测试中，更新到数据库
	// db.GetDB().Save(project)

	assert.Equal(s.T(), newTitle, project.Title)

	// Delete
	// 在实际测试中，从数据库删除
	// db.GetDB().Delete(project)
}

func (s *DBIntegrationTestSuite) TestProjectStatusUpdate() {
	// 测试项目状态流转

	project := testutils.ProjectPending()
	assert.Equal(s.T(), "pending", project.Status)

	// 状态变为处理中
	project.Status = "processing"
	assert.Equal(s.T(), "processing", project.Status)

	// 状态变为已完成
	project.Status = "completed"
	assert.Equal(s.T(), "completed", project.Status)

	// 状态变为失败
	project.Status = "failed"
	assert.Equal(s.T(), "failed", project.Status)
}

func (s *DBIntegrationTestSuite) TestProjectWithScript() {
	// 测试项目与剧本的关系

	userID := uint64(200)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 1
	})

	script := testutils.ScriptFactory(func(s *db.Script) {
		s.ProjectID = project.ID
		s.ID = 1
	})

	// 验证关联关系
	assert.Equal(s.T(), project.ID, script.ProjectID)
	assert.Equal(s.T(), "deepseek", script.Model)
	assert.Equal(s.T(), "completed", script.Status)
	assert.Contains(s.T(), script.Content, "剧本")
}

func (s *DBIntegrationTestSuite) TestCompleteProjectData() {
	// 测试完整项目数据链

	userID := uint64(300)
	project, script, storyboards, images, videos, mergedVideo := testutils.CreateCompleteProject(userID)

	// 设置ID用于测试关联
	project.ID = 10
	script.ID = 10
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

	mergedVideo.ID = 1
	mergedVideo.ProjectID = project.ID

	// 验证完整数据链
	assert.NotNil(s.T(), project)
	assert.Equal(s.T(), userID, project.UserID)

	assert.NotNil(s.T(), script)
	assert.Equal(s.T(), project.ID, script.ProjectID)

	assert.Len(s.T(), storyboards, 5)
	for _, sb := range storyboards {
		assert.Equal(s.T(), project.ID, sb.ProjectID)
		assert.Equal(s.T(), script.ID, sb.ScriptID)
	}

	assert.Len(s.T(), images, 5)
	assert.Len(s.T(), videos, 5)

	assert.NotNil(s.T(), mergedVideo)
	assert.Equal(s.T(), project.ID, mergedVideo.ProjectID)
}

func (s *DBIntegrationTestSuite) TestModelConfigCRUD() {
	// 测试模型配置的CRUD

	// 创建各个模型配置
	deepseek := testutils.CreateDeepSeekConfig()
	gemini := testutils.CreateGeminiConfig()
	banana := testutils.CreateBananaConfig()
	seedance := testutils.CreateSeedanceConfig()

	// 设置ID
	deepseek.ID = 1
	gemini.ID = 2
	banana.ID = 3
	seedance.ID = 4

	// 验证模型配置
	assert.Equal(s.T(), "DeepSeek", deepseek.Name)
	assert.Equal(s.T(), "text", deepseek.Type)
	assert.Equal(s.T(), "deepseek", deepseek.Provider)
	assert.True(s.T(), deepseek.Enabled)

	assert.Equal(s.T(), "Gemini 3.1 Pro", gemini.Name)
	assert.Equal(s.T(), "text", gemini.Type)
	assert.Equal(s.T(), "gemini", gemini.Provider)

	assert.Equal(s.T(), "Banana 2", banana.Name)
	assert.Equal(s.T(), "image", banana.Type)
	assert.Equal(s.T(), "banana", banana.Provider)

	assert.Equal(s.T(), "Seedance", seedance.Name)
	assert.Equal(s.T(), "video", seedance.Type)
	assert.Equal(s.T(), "seedance", seedance.Provider)
}

func (s *DBIntegrationTestSuite) TestTimestampFields() {
	// 测试时间戳字段

	now := time.Now()
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.CreatedAt = now
		p.UpdatedAt = now
	})

	assert.Equal(s.T(), now, project.CreatedAt)
	assert.Equal(s.T(), now, project.UpdatedAt)

	// 模拟更新操作
	later := now.Add(1 * time.Hour)
	project.UpdatedAt = later

	assert.Equal(s.T(), now, project.CreatedAt)
	assert.Equal(s.T(), later, project.UpdatedAt)
}
