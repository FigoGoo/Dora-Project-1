package testutils

import (
	"dora-magic-box/internal/dal/db"
	"dora-magic-box/internal/pkg/config"
	testutils "dora-magic-box/test/utils"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

// TestClient 测试客户端
type TestClient struct {
	HTTPClient *http.Client
	ServerAddr string
}

// TestSuite 基础测试套件
type TestSuite struct {
	suite.Suite
	DB        *gorm.DB
	Hertz     *server.Hertz
	TestClient *TestClient
}

// SetupSuite 初始化测试套件
func (s *TestSuite) SetupSuite() {
	// 初始化配置 - 使用测试配置
	err := config.Init("configs/test_config.yaml")
	s.Require().NoError(err)

	// 初始化数据库连接
	err = db.Init()
	s.Require().NoError(err)
	s.DB = db.GetDB()

	// 初始化数据库表
	err = db.AutoMigrate()
	s.Require().NoError(err)
}

// TearDownSuite 清理测试套件
func (s *TestSuite) TearDownSuite() {
	// 删除所有测试数据
	tables := []interface{}{
		&db.Project{},
		&db.Script{},
		&db.Storyboard{},
		&db.Image{},
		&db.Video{},
		&db.MergedVideo{},
		&db.ModelConfig{},
		&db.User{},
	}

	for _, table := range tables {
		s.DB.Unscoped().Delete(table)
	}
}

// SetupTest 每个测试前的设置
func (s *TestSuite) SetupTest() {
	// 在每个测试前可以做一些初始化工作
}

// TearDownTest 每个测试后的清理
func (s *TestSuite) TearDownTest() {
	// 在每个测试后可以做一些清理工作
}

// TruncateTables 清空所有表数据
func TruncateTables(db *gorm.DB) {
	tables := []interface{}{
		&db.Project{},
		&db.Script{},
		&db.Storyboard{},
		&db.Image{},
		&db.Video{},
		&db.MergedVideo{},
		&db.ModelConfig{},
		&db.User{},
	}

	for _, table := range tables {
		db.Unscoped().Delete(table)
	}
}

// NewTestRequest 创建测试请求
func NewTestRequest(method, url string, body interface{}) (*http.Request, error) {
	var reqBody []byte
	if body != nil {
		var err error
		reqBody, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}

	if reqBody != nil {
		req.Header.Set("Content-Type", "application/json")
		req.GetBody = func() (func() ([]byte, error), error) {
			return func() ([]byte, error) {
				return reqBody, nil
			}, nil
		}
	}

	req.Header.Set("User-Agent", "IntegrationTest/1.0")

	return req, nil
}

// PerformRequest 执行HTTP请求
func PerformRequest(h *server.Hertz, req *http.Request) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	return w
}
