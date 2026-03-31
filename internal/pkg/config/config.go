package config

import (
	"fmt"
	"github.com/spf13/viper"
	"sync"
)

var (
	cfg     *Config
	once    sync.Once
)

// Config 应用配置
type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Server   ServerConfig   `mapstructure:"server"`
	MySQL    MySQLConfig    `mapstructure:"mysql"`
	Redis    RedisConfig    `mapstructure:"redis"`
	MinIO    MinIOConfig    `mapstructure:"minio"`
	RocketMQ RocketMQConfig `mapstructure:"rocketmq"`
	Etcd     EtcdConfig     `mapstructure:"etcd"`
}

// AppConfig 应用配置
type AppConfig struct {
	Name        string `mapstructure:"name"`
	Mode        string `mapstructure:"mode"`
	Environment string `mapstructure:"environment"`
}

// ServerConfig 服务配置
type ServerConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

// MySQLConfig MySQL配置
type MySQLConfig struct {
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	User         string `mapstructure:"user"`
	Password     string `mapstructure:"password"`
	Database     string `mapstructure:"database"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
}

func (m MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		m.User, m.Password, m.Host, m.Port, m.Database)
}

// RedisConfig Redis配置
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

func (r RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", r.Host, r.Port)
}

// MinIOConfig MinIO配置
type MinIOConfig struct {
	Endpoint        string `mapstructure:"endpoint"`
	AccessKeyID     string `mapstructure:"access_key_id"`
	SecretAccessKey string `mapstructure:"secret_access_key"`
	Bucket          string `mapstructure:"bucket"`
	UseSSL          bool   `mapstructure:"use_ssl"`
}

// RocketMQConfig RocketMQ配置
type RocketMQConfig struct {
	Endpoint      string   `mapstructure:"endpoint"`
	NameServers   []string `mapstructure:"name_servers"`
	GroupName     string   `mapstructure:"group_name"`
	RetryTimes    int      `mapstructure:"retry_times"`
	ProducerGroup string   `mapstructure:"producer_group"`
	ConsumerGroup string   `mapstructure:"consumer_group"`
}

// EtcdConfig Etcd配置
type EtcdConfig struct {
	Endpoints   []string `mapstructure:"endpoints"`
	DialTimeout int      `mapstructure:"dial_timeout"`
	Username    string   `mapstructure:"username"`
	Password    string   `mapstructure:"password"`
}

// Init 初始化配置
func Init(configPath string) error {
	var err error
	once.Do(func() {
		viper.SetConfigFile(configPath)
		viper.SetConfigType("yaml")

		viper.AutomaticEnv()
		viper.SetEnvPrefix("DORA")

		if err = viper.ReadInConfig(); err != nil {
			err = fmt.Errorf("读取配置文件失败: %w", err)
			return
		}

		cfg = &Config{}
		if err = viper.Unmarshal(cfg); err != nil {
			err = fmt.Errorf("解析配置失败: %w", err)
			return
		}
	})
	return err
}

// Get 获取配置实例
func Get() *Config {
	if cfg == nil {
		_ = Init("configs/config.yaml")
	}
	return cfg
}

// MustGet 必须获取配置，否则panic
func MustGet() *Config {
	if cfg == nil {
		if err := Init("configs/config.yaml"); err != nil {
			panic(err)
		}
	}
	return cfg
}
