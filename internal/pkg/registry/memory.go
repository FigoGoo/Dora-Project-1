package registry

import (
	"context"
	"fmt"
	"sync"
)

// MemoryRegistry 内存实现的服务注册与发现（用于开发测试）
type MemoryRegistry struct {
	services map[string][]*ServiceInstance
	mu       sync.RWMutex
	watchers map[string]map[chan *WatchEvent]bool
}

// NewMemoryRegistry 创建内存注册中心
func NewMemoryRegistry() Registry {
	return &MemoryRegistry{
		services: make(map[string][]*ServiceInstance),
		watchers: make(map[string]map[chan *WatchEvent]bool),
	}
}

// Register 注册服务
func (r *MemoryRegistry) Register(ctx context.Context, instance *ServiceInstance, ttl int64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// 检查是否已存在
	instances := r.services[instance.ServiceName]
	for i, inst := range instances {
		if inst.Address == instance.Address && inst.Port == instance.Port {
			instances[i] = instance
			r.services[instance.ServiceName] = instances
			r.notifyWatchers(instance.ServiceName, &WatchEvent{
				EventType: EventTypeUpdate,
				Instance:  instance,
			})
			return nil
		}
	}

	// 添加新实例
	r.services[instance.ServiceName] = append(instances, instance)
	r.notifyWatchers(instance.ServiceName, &WatchEvent{
		EventType: EventTypeAdd,
		Instance:  instance,
	})

	return nil
}

// Unregister 注销服务
func (r *MemoryRegistry) Unregister(ctx context.Context, instance *ServiceInstance) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	instances, ok := r.services[instance.ServiceName]
	if !ok {
		return nil
	}

	// 查找并移除
	for i, inst := range instances {
		if inst.Address == instance.Address && inst.Port == instance.Port {
			newInstances := append(instances[:i], instances[i+1:]...)
			r.services[instance.ServiceName] = newInstances
			r.notifyWatchers(instance.ServiceName, &WatchEvent{
				EventType: EventTypeDelete,
				Instance:  instance,
			})
			break
		}
	}

	return nil
}

// Discover 发现服务
func (r *MemoryRegistry) Discover(ctx context.Context, serviceName string) ([]*ServiceInstance, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	instances, ok := r.services[serviceName]
	if !ok {
		return []*ServiceInstance{}, nil
	}

	// 返回副本
	result := make([]*ServiceInstance, len(instances))
	copy(result, instances)
	return result, nil
}

// Watch 监听服务变化
func (r *MemoryRegistry) Watch(ctx context.Context, serviceName string) (<-chan *WatchEvent, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	eventChan := make(chan *WatchEvent, 10)

	if _, ok := r.watchers[serviceName]; !ok {
		r.watchers[serviceName] = make(map[chan *WatchEvent]bool)
	}
	r.watchers[serviceName][eventChan] = true

	// 当context取消时清理watcher
	go func() {
		<-ctx.Done()
		r.mu.Lock()
		defer r.mu.Unlock()
		if watchers, ok := r.watchers[serviceName]; ok {
			delete(watchers, eventChan)
		}
		close(eventChan)
	}()

	return eventChan, nil
}

// Close 关闭注册中心
func (r *MemoryRegistry) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// 关闭所有watcher
	for serviceName, watchers := range r.watchers {
		for ch := range watchers {
			close(ch)
			delete(watchers, ch)
		}
		delete(r.watchers, serviceName)
	}

	// 清空服务
	r.services = make(map[string][]*ServiceInstance)
	return nil
}

// notifyWatchers 通知所有watcher
func (r *MemoryRegistry) notifyWatchers(serviceName string, event *WatchEvent) {
	if watchers, ok := r.watchers[serviceName]; ok {
		for ch := range watchers {
			select {
			case ch <- event:
			default:
			}
		}
	}
}

// globalRegistry 全局注册中心实例
var (
	globalRegistry Registry
	registryOnce   sync.Once
)

// InitRegistry 初始化全局注册中心
func InitRegistry(useEtcd bool, endpoints []string, dialTimeout int, username, password string) error {
	var err error
	registryOnce.Do(func() {
		// 目前只支持内存实现
		globalRegistry = NewMemoryRegistry()
	})
	return err
}

// GetRegistry 获取全局注册中心
func GetRegistry() Registry {
	if globalRegistry == nil {
		// 默认使用内存注册中心
		_ = InitRegistry(false, nil, 0, "", "")
	}
	return globalRegistry
}

// ServiceKey 生成服务键
func ServiceKey(serviceName, address string, port int) string {
	return fmt.Sprintf("%s-%s-%d", serviceName, address, port)
}
