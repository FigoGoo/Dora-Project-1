package registry

import (
	"context"
)

// ServiceInstance 服务实例信息
type ServiceInstance struct {
	ServiceName string
	Address     string
	Port        int
	Metadata    map[string]string
}

// Registry 服务注册与发现接口
type Registry interface {
	Register(ctx context.Context, instance *ServiceInstance, ttl int64) error
	Unregister(ctx context.Context, instance *ServiceInstance) error
	Discover(ctx context.Context, serviceName string) ([]*ServiceInstance, error)
	Watch(ctx context.Context, serviceName string) (<-chan *WatchEvent, error)
	Close() error
}

// WatchEvent 服务变化事件
type WatchEvent struct {
	EventType EventType
	Instance  *ServiceInstance
}

// EventType 事件类型
type EventType int

const (
	// EventTypeAdd 服务添加事件
	EventTypeAdd EventType = iota
	// EventTypeDelete 服务删除事件
	EventTypeDelete
	// EventTypeUpdate 服务更新事件
	EventTypeUpdate
)
