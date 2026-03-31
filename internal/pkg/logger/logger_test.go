package logger

import (
	"os"
	"sync"
	"testing"

	"github.com/stretchr/testify/suite"
	"go.uber.org/zap"
)

// LoggerTestSuite 日志测试套件
type LoggerTestSuite struct {
	suite.Suite
	logDir string
}

func (s *LoggerTestSuite) SetupTest() {
	s.logDir = "logs"
	// 重置单例
	log = nil
	sugar = nil
	once = sync.Once{}
}

func (s *LoggerTestSuite) TearDownTest() {
	log = nil
	sugar = nil
	once = sync.Once{}
	// 清理日志文件
	if _, err := os.Stat(s.logDir + "/app.log"); err == nil {
		_ = os.Remove(s.logDir + "/app.log")
	}
}

// TestInitDevelopmentMode 测试开发模式初始化
func (s *LoggerTestSuite) TestInitDevelopmentMode() {
	err := Init("development")
	s.NoError(err)

	l := GetLogger()
	s.NotNil(l)
	s.IsType((*zap.Logger)(nil), l)

	sg := GetSugaredLogger()
	s.NotNil(sg)
	s.IsType((*zap.SugaredLogger)(nil), sg)
}

// TestInitProductionMode 测试生产模式初始化
func (s *LoggerTestSuite) TestInitProductionMode() {
	err := Init("production")
	s.NoError(err)

	l := GetLogger()
	s.NotNil(l)
	s.IsType((*zap.Logger)(nil), l)
}

// TestInitUnknownMode 测试未知模式初始化
func (s *LoggerTestSuite) TestInitUnknownMode() {
	err := Init("unknown")
	s.NoError(err)

	l := GetLogger()
	s.NotNil(l)
}

// TestGetWithoutInit 测试未初始化时调用GetLogger
func (s *LoggerTestSuite) TestGetWithoutInit() {
	l := GetLogger()
	s.NotNil(l)

	sg := GetSugaredLogger()
	s.NotNil(sg)
}

// TestSingleton 测试单例模式
func (s *LoggerTestSuite) TestSingleton() {
	err := Init("development")
	s.NoError(err)

	l1 := GetLogger()
	l2 := GetLogger()
	s.Equal(l1, l2)

	sg1 := GetSugaredLogger()
	sg2 := GetSugaredLogger()
	s.Equal(sg1, sg2)
}

// TestLogMethods 测试日志方法
func (s *LoggerTestSuite) TestLogMethods() {
	err := Init("development")
	s.NoError(err)

	// 测试各种日志方法
	Debug("debug message")
	Info("info message")
	Warn("warn message")
	Error("error message")

	s.NotPanics(func() {
		Debug("debug test")
	})
	s.NotPanics(func() {
		Info("info test")
	})
	s.NotPanics(func() {
		Warn("warn test")
	})
	s.NotPanics(func() {
		Error("error test")
	})
}

// TestWithFields 测试带字段的日志
func (s *LoggerTestSuite) TestWithFields() {
	err := Init("development")
	s.NoError(err)

	loggerWithFields := With(zap.String("key", "value"), zap.Int("count", 10))
	s.NotNil(loggerWithFields)
	s.IsType((*zap.Logger)(nil), loggerWithFields)

	// 测试方法调用不会panic
	s.NotPanics(func() {
		loggerWithFields.Debug("debug with fields")
	})
	s.NotPanics(func() {
		loggerWithFields.Info("info with fields")
	})
}

// TestSugaredLogger 测试SugaredLogger
func (s *LoggerTestSuite) TestSugaredLogger() {
	err := Init("development")
	s.NoError(err)

	sg := S()
	s.NotNil(sg)

	s.NotPanics(func() {
		sg.Debugf("debug formatted: %s", "test")
	})
	s.NotPanics(func() {
		sg.Infof("info formatted: %d", 42)
	})
}

// TestLoggerTestSuite 运行测试套件
func TestLoggerTestSuite(t *testing.T) {
	suite.Run(t, new(LoggerTestSuite))
}
