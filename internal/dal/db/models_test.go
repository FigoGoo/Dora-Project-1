package db

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestProjectModel 测试Project模型
func TestProjectModel(t *testing.T) {
	t.Run("TestProjectCreation", func(t *testing.T) {
		now := time.Now()

		project := Project{
			BaseModel: BaseModel{
				ID:        1,
				CreatedAt: now,
				UpdatedAt: now,
			},
			UserID:      100,
			Title:       "测试项目",
			Description: "这是一个测试项目",
			Status:      "pending",
			Duration:    60,
		}

		assert.Equal(t, uint64(1), project.ID)
		assert.Equal(t, uint64(100), project.UserID)
		assert.Equal(t, "测试项目", project.Title)
		assert.Equal(t, "这是一个测试项目", project.Description)
		assert.Equal(t, "pending", project.Status)
		assert.Equal(t, 60, project.Duration)
		assert.Equal(t, now, project.CreatedAt)
		assert.Equal(t, now, project.UpdatedAt)
	})

	t.Run("TestProjectStatusValues", func(t *testing.T) {
		validStatuses := []string{"pending", "processing", "completed", "failed"}
		for _, status := range validStatuses {
			project := Project{Status: status}
			assert.Equal(t, status, project.Status)
		}
	})
}

// TestScriptModel 测试Script模型
func TestScriptModel(t *testing.T) {
	t.Run("TestScriptCreation", func(t *testing.T) {
		script := Script{
			BaseModel: BaseModel{
				ID: 1,
			},
			ProjectID: 1,
			Content:   "这是一个测试剧本的内容...",
			Model:     "deepseek",
			Status:    "completed",
		}

		assert.Equal(t, uint64(1), script.ID)
		assert.Equal(t, uint64(1), script.ProjectID)
		assert.Equal(t, "这是一个测试剧本的内容...", script.Content)
		assert.Equal(t, "deepseek", script.Model)
		assert.Equal(t, "completed", script.Status)
	})
}

// TestStoryboardModel 测试Storyboard模型
func TestStoryboardModel(t *testing.T) {
	t.Run("TestStoryboardCreation", func(t *testing.T) {
		storyboard := Storyboard{
			BaseModel: BaseModel{
				ID: 1,
			},
			ProjectID:   1,
			ScriptID:    1,
			Sequence:    1,
			Description: "镜头1描述",
			Prompt:      "一个美丽的风景",
			Duration:    5,
			Status:      "pending",
		}

		assert.Equal(t, uint64(1), storyboard.ID)
		assert.Equal(t, uint64(1), storyboard.ProjectID)
		assert.Equal(t, uint64(1), storyboard.ScriptID)
		assert.Equal(t, 1, storyboard.Sequence)
		assert.Equal(t, "镜头1描述", storyboard.Description)
		assert.Equal(t, "一个美丽的风景", storyboard.Prompt)
		assert.Equal(t, 5, storyboard.Duration)
		assert.Equal(t, "pending", storyboard.Status)
	})
}

// TestImageModel 测试Image模型
func TestImageModel(t *testing.T) {
	t.Run("TestImageCreation", func(t *testing.T) {
		image := Image{
			BaseModel: BaseModel{
				ID: 1,
			},
			StoryboardID: 1,
			URL:          "https://minio.local/bucket/image.jpg",
			Prompt:       "一个美丽的风景",
			Model:        "banana-2",
			Status:       "completed",
		}

		assert.Equal(t, uint64(1), image.ID)
		assert.Equal(t, uint64(1), image.StoryboardID)
		assert.Equal(t, "https://minio.local/bucket/image.jpg", image.URL)
		assert.Equal(t, "一个美丽的风景", image.Prompt)
		assert.Equal(t, "banana-2", image.Model)
		assert.Equal(t, "completed", image.Status)
	})
}

// TestVideoModel 测试Video模型
func TestVideoModel(t *testing.T) {
	t.Run("TestVideoCreation", func(t *testing.T) {
		video := Video{
			BaseModel: BaseModel{
				ID: 1,
			},
			StoryboardID: 1,
			URL:          "https://minio.local/bucket/video.mp4",
			ImageURLs:    `["url1.jpg", "url2.jpg"]`,
			Model:        "seedance",
			Duration:     5,
			Status:       "completed",
		}

		assert.Equal(t, uint64(1), video.ID)
		assert.Equal(t, uint64(1), video.StoryboardID)
		assert.Equal(t, "https://minio.local/bucket/video.mp4", video.URL)
		assert.Contains(t, video.ImageURLs, "url1.jpg")
		assert.Contains(t, video.ImageURLs, "url2.jpg")
		assert.Equal(t, "seedance", video.Model)
		assert.Equal(t, 5, video.Duration)
		assert.Equal(t, "completed", video.Status)
	})
}

// TestMergedVideoModel 测试MergedVideo模型
func TestMergedVideoModel(t *testing.T) {
	t.Run("TestMergedVideoCreation", func(t *testing.T) {
		video := MergedVideo{
			BaseModel: BaseModel{
				ID: 1,
			},
			ProjectID:    1,
			URL:          "https://minio.local/bucket/merged_video.mp4",
			SegmentURLs:  `["segment1.mp4", "segment2.mp4"]`,
			Duration:     10,
			Status:       "completed",
		}

		assert.Equal(t, uint64(1), video.ID)
		assert.Equal(t, uint64(1), video.ProjectID)
		assert.Equal(t, "https://minio.local/bucket/merged_video.mp4", video.URL)
		assert.Contains(t, video.SegmentURLs, "segment1.mp4")
		assert.Contains(t, video.SegmentURLs, "segment2.mp4")
		assert.Equal(t, 10, video.Duration)
		assert.Equal(t, "completed", video.Status)
	})
}

// TestModelConfigModel 测试ModelConfig模型
func TestModelConfigModel(t *testing.T) {
	t.Run("TestModelConfigCreation", func(t *testing.T) {
		config := ModelConfig{
			BaseModel: BaseModel{
				ID: 1,
			},
			Name:     "DeepSeek",
			Type:     "text",
			Provider: "deepseek",
			Endpoint: "https://api.deepseek.com",
			Params:   `{"temperature": 0.7}`,
			Enabled:  true,
		}

		assert.Equal(t, uint64(1), config.ID)
		assert.Equal(t, "DeepSeek", config.Name)
		assert.Equal(t, "text", config.Type)
		assert.Equal(t, "deepseek", config.Provider)
		assert.Equal(t, "https://api.deepseek.com", config.Endpoint)
		assert.Contains(t, config.Params, "temperature")
		assert.Equal(t, true, config.Enabled)
	})
}

// TestUserModel 测试User模型
func TestUserModel(t *testing.T) {
	t.Run("TestUserCreation", func(t *testing.T) {
		user := User{
			BaseModel: BaseModel{
				ID: 1,
			},
			Username: "testuser",
			Email:    "test@example.com",
			Password: "$2a$10$...", // bcrypt hash
			Nickname: "测试用户",
			Avatar:   "",
			Status:   "active",
		}

		assert.Equal(t, uint64(1), user.ID)
		assert.Equal(t, "testuser", user.Username)
		assert.Equal(t, "test@example.com", user.Email)
		assert.NotEmpty(t, user.Password)
		assert.Equal(t, "测试用户", user.Nickname)
		assert.Equal(t, "active", user.Status)
	})
}

// TestBaseModel 测试BaseModel字段
func TestBaseModel(t *testing.T) {
	t.Run("TestBaseModelFields", func(t *testing.T) {
		now := time.Now()
		base := BaseModel{
			ID:        1,
			CreatedAt: now,
			UpdatedAt: now,
		}

		assert.Equal(t, uint64(1), base.ID)
		assert.Equal(t, now, base.CreatedAt)
		assert.Equal(t, now, base.UpdatedAt)
		assert.True(t, base.DeletedAt.Time.IsZero())
	})
}
