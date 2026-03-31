package config

import (
	"os"
	"sync"
	"testing"

	"github.com/stretchr/testify/suite"
)

// ConfigTestSuite 配置测试套件
type ConfigTestSuite struct {
	suite.Suite
	tempDir string
}

func (s *ConfigTestSuite) SetupTest() {
	s.tempDir = s.T().TempDir()
	// 重置单例
	cfg = nil
	once = sync.Once{}
}

func (s *ConfigTestSuite) TearDownTest() {
	cfg = nil
	once = sync.Once{}
}

// TestLoadConfig_Success 测试正常加载配置
func (s *ConfigTestSuite) TestLoadConfig_Success() {
	configYAML := `
app:
  name: dora-test
  mode: test
  environment: development
server:
  host: 0.0.0.0
  port: 8080
mysql:
  host: localhost
  port: 3306
  user: root
  password: secret
  database: dora_test
  max_idle_conns: 10
  max_open_conns: 100
redis:
  host: localhost
  port: 6379
  password: ""
  db: 0
minio:
  endpoint: localhost:9000
  access_key_id: minioadmin
  secret_access_key: minioadmin
  bucket: dora
  use_ssl: false
rocketmq:
  name_servers:
    - localhost:9876
  group_name: dora-group
`
	configPath := s.tempDir + "/config.yaml"
	err := os.WriteFile(configPath, []byte(configYAML), 0644)
	s.Require().NoError(err)

	err = Init(configPath)
	s.NoError(err)

	c := Get()
	s.Equal("dora-test", c.App.Name)
	s.Equal("test", c.App.Mode)
	s.Equal("development", c.App.Environment)
	s.Equal("0.0.0.0", c.Server.Host)
	s.Equal(8080, c.Server.Port)
	s.Equal("localhost", c.MySQL.Host)
	s.Equal(3306, c.MySQL.Port)
	s.Equal("root", c.MySQL.User)
	s.Equal("secret", c.MySQL.Password)
	s.Equal("dora_test", c.MySQL.Database)
	s.Equal(10, c.MySQL.MaxIdleConns)
	s.Equal(100, c.MySQL.MaxOpenConns)
	s.Equal("localhost", c.Redis.Host)
	s.Equal(6379, c.Redis.Port)
	s.Equal("", c.Redis.Password)
	s.Equal(0, c.Redis.DB)
	s.Equal("localhost:9000", c.MinIO.Endpoint)
	s.Equal("minioadmin", c.MinIO.AccessKeyID)
	s.Equal("minioadmin", c.MinIO.SecretAccessKey)
	s.Equal("dora", c.MinIO.Bucket)
	s.Equal(false, c.MinIO.UseSSL)
	s.Equal([]string{"localhost:9876"}, c.RocketMQ.NameServers)
	s.Equal("dora-group", c.RocketMQ.GroupName)
}

// TestLoadConfig_FileNotExists 测试配置文件不存在
func (s *ConfigTestSuite) TestLoadConfig_FileNotExists() {
	err := Init(s.tempDir + "/not_exist.yaml")
	s.Error(err)
	s.Contains(err.Error(), "读取配置文件失败")
}

// TestLoadConfig_InvalidYAML 测试无效的YAML格式
func (s *ConfigTestSuite) TestLoadConfig_InvalidYAML() {
	configYAML := `
app:
  name: dora-test
  mode: test
  invalid_yaml: {
`
	configPath := s.tempDir + "/bad_config.yaml"
	err := os.WriteFile(configPath, []byte(configYAML), 0644)
	s.Require().NoError(err)

	err = Init(configPath)
	s.Error(err)
}

// TestMySQLConfig_DSN 测试MySQL DSN生成
func (s *ConfigTestSuite) TestMySQLConfig_DSN() {
	m := MySQLConfig{
		Host:     "localhost",
		Port:     3306,
		User:     "root",
		Password: "secret",
		Database: "dora",
	}

	dsn := m.DSN()
	s.Contains(dsn, "root:secret@tcp(localhost:3306)/dora")
	s.Contains(dsn, "charset=utf8mb4")
	s.Contains(dsn, "parseTime=True")
	s.Contains(dsn, "loc=Local")
}

// TestRedisConfig_Addr 测试Redis地址生成
func (s *ConfigTestSuite) TestRedisConfig_Addr() {
	r := RedisConfig{
		Host: "redis.local",
		Port: 6380,
	}

	addr := r.Addr()
	s.Equal("redis.local:6380", addr)
}

// TestSingleton 测试单例模式
func (s *ConfigTestSuite) TestSingleton() {
	configYAML := `
app:
  name: dora-singleton
  mode: test
server:
  host: 0.0.0.0
  port: 8080
`
	configPath := s.tempDir + "/singleton_config.yaml"
	err := os.WriteFile(configPath, []byte(configYAML), 0644)
	s.Require().NoError(err)

	err = Init(configPath)
	s.NoError(err)

	c1 := Get()
	c2 := Get()
	s.Equal(c1, c2)
}

// TestGetWithoutInit 测试未初始化时调用Get
func (s *ConfigTestSuite) TestGetWithoutInit() {
	// 如果没有初始化，会尝试默认路径，这里可能返回nil或者默认配置
	// 我们只验证不会panic
	s.NotPanics(func() {
		_ = Get()
	})
}

// TestMustGet_Panic 测试MustGet在配置无效时panic
func (s *ConfigTestSuite) TestMustGet_Panic() {
	s.Panics(func() {
		_ = MustGet()
	})
}

// TestConfigTestSuite 运行测试套件
func TestConfigTestSuite(t *testing.T) {
	suite.Run(t, new(ConfigTestSuite))
}
