package db

import (
	"time"
	"gorm.io/gorm"
)

// BaseModel 基础模型
type BaseModel struct {
	ID        uint64         `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Project 项目
type Project struct {
	BaseModel
	UserID      uint64 `gorm:"index" json:"user_id"`
	Title       string `gorm:"size:255;not null" json:"title"`
	Description string `gorm:"type:text" json:"description"`
	Status      string `gorm:"size:50;default:'pending'" json:"status"` // pending, processing, completed, failed
	Duration    int    `json:"duration"`                               // 视频时长(秒)
}

// Script 剧本
type Script struct {
	BaseModel
	ProjectID uint64 `gorm:"index;not null" json:"project_id"`
	Content   string `gorm:"type:text;not null" json:"content"`
	Model     string `gorm:"size:100" json:"model"`
	Status    string `gorm:"size:50;default:'pending'" json:"status"`
}

// Storyboard 分镜
type Storyboard struct {
	BaseModel
	ProjectID uint64 `gorm:"index;not null" json:"project_id"`
	ScriptID  uint64 `gorm:"index;not null" json:"script_id"`
	Sequence  int    `gorm:"not null" json:"sequence"`             // 镜头序号
	Description string `gorm:"type:text" json:"description"`       // 镜头描述
	Prompt    string `gorm:"type:text" json:"prompt"`             // 画面提示词
	Duration  int    `json:"duration"`                            // 镜头时长(秒)
	Status    string `gorm:"size:50;default:'pending'" json:"status"`
}

// Image 画面
type Image struct {
	BaseModel
	StoryboardID uint64 `gorm:"index;not null" json:"storyboard_id"`
	URL          string `gorm:"size:500" json:"url"`
	Prompt       string `gorm:"type:text" json:"prompt"`
	Model        string `gorm:"size:100" json:"model"`
	Status       string `gorm:"size:50;default:'pending'" json:"status"`
}

// Video 视频
type Video struct {
	BaseModel
	StoryboardID uint64   `gorm:"index;not null" json:"storyboard_id"`
	URL          string   `gorm:"size:500" json:"url"`
	ImageURLs    string   `gorm:"type:text" json:"image_urls"`  // JSON数组
	Model        string   `gorm:"size:100" json:"model"`
	Duration     int      `json:"duration"`
	Status       string   `gorm:"size:50;default:'pending'" json:"status"`
}

// MergedVideo 合并后的视频
type MergedVideo struct {
	BaseModel
	ProjectID    uint64 `gorm:"index;not null" json:"project_id"`
	URL          string `gorm:"size:500" json:"url"`
	SegmentURLs  string `gorm:"type:text" json:"segment_urls"` // JSON数组
	Duration     int    `json:"duration"`
	Status       string `gorm:"size:50;default:'pending'" json:"status"`
}

// ModelConfig 模型配置
type ModelConfig struct {
	BaseModel
	Name     string `gorm:"size:100;not null;uniqueIndex" json:"name"`
	Type     string `gorm:"size:50;not null" json:"type"`      // text, image, video
	Provider string `gorm:"size:50;not null" json:"provider"`  // deepseek, gemini, banana, seedance
	Endpoint string `gorm:"size:500" json:"endpoint"`
	Params   string `gorm:"type:text" json:"params"`          // JSON对象
	Enabled  bool   `gorm:"default:true" json:"enabled"`
}

// User 用户
type User struct {
	BaseModel
	Username string `gorm:"size:100;uniqueIndex;not null" json:"username"`
	Email    string `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password string `gorm:"size:255;not null" json:"-"`
	Nickname string `gorm:"size:100" json:"nickname"`
	Avatar   string `gorm:"size:500" json:"avatar"`
	Status   string `gorm:"size:50;default:'active'" json:"status"`
}

// Workflow 工作流
type Workflow struct {
	BaseModel
	ProjectID   uint64 `gorm:"index;not null" json:"project_id"`
	Status      string `gorm:"size:50;default:'pending'" json:"status"`       // pending, running, completed, failed, paused
	CurrentStep string `gorm:"size:50;default:'init'" json:"current_step"`     // init, script, storyboard, image, video, merge, complete
	TotalSteps  int    `gorm:"default:6" json:"total_steps"`                   // 总步骤数
	Progress    int    `gorm:"default:0" json:"progress"`                      // 进度百分比
	StepStatus  string `gorm:"type:text" json:"step_status"`                   // JSON格式存储各步骤状态
	ErrorMsg    string `gorm:"type:text" json:"error_msg"`                      // 错误信息
}
