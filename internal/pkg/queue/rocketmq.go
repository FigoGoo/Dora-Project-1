package queue

import (
	"context"
	"dora-magic-box/internal/pkg/config"
	"dora-magic-box/internal/pkg/logger"
	"fmt"
	"sync"
	"time"
)

// MessageType 消息类型
type MessageType string

const (
	MessageTypeGenerateImage    MessageType = "generate_image"
	MessageTypeGenerateVideo    MessageType = "generate_video"
	MessageTypeMergeVideo       MessageType = "merge_video"
	MessageTypePublishVideo     MessageType = "publish_video"
	MessageTypeGenerateScript   MessageType = "generate_script"
	MessageTypeSplitStoryboard  MessageType = "split_storyboard"
	MessageTypeWorkflow         MessageType = "workflow"
)

// QueueMessage 队列消息结构
type QueueMessage struct {
	ID         string                 `json:"id"`
	Type       MessageType            `json:"type"`
	Data       map[string]interface{} `json:"data"`
	Timestamp  int64                  `json:"timestamp"`
	RetryCount int                    `json:"retry_count"`
}

// 简化的消息生产消费接口 - 使用内存直接处理
var (
	handlerMap = make(map[string]func(*QueueMessage) error)
	mu         sync.RWMutex
)

// Init 初始化队列系统
func Init(cfg interface{}) error {
	logger.Info("正在初始化消息队列")

	// 检查是否提供了配置
	_, ok := cfg.(*config.RocketMQConfig)
	if !ok && cfg != nil {
		logger.Warn("配置类型不匹配，使用内存队列模式")
	}

	logger.Info("消息队列初始化成功（内存模式）")
	return nil
}

// StartConsumer 启动消费者
func StartConsumer(topic string, handler func(*QueueMessage) error) error {
	logger.Info("注册消费者", logger.String("topic", topic))

	mu.Lock()
	handlerMap[topic] = handler
	mu.Unlock()

	return nil
}

// SendMessage 发送消息到队列（直接调用消费者处理）
func SendMessage(topic string, msg *QueueMessage) error {
	logger.Info("发送消息",
		logger.String("topic", topic),
		logger.String("type", string(msg.Type)),
		logger.String("msg_id", msg.ID),
	)

	mu.RLock()
	handler, ok := handlerMap[topic]
	mu.RUnlock()

	if ok {
		go func() {
			logger.Info("处理消息", logger.String("topic", topic), logger.String("msg_id", msg.ID))
			if err := handler(msg); err != nil {
				logger.Error("消息处理失败",
					logger.String("topic", topic),
					logger.String("msg_id", msg.ID),
					logger.ErrorField(err),
				)
			}
		}()
		return nil
	}

	logger.Warn("未找到消费者", logger.String("topic", topic))
	return nil
}

// SendMessageAsync 异步发送消息
func SendMessageAsync(topic string, msg *QueueMessage, callback func(context.Context, interface{}, error)) {
	go func() {
		err := SendMessage(topic, msg)
		result := map[string]interface{}{"msg_id": msg.ID}
		if callback != nil {
			callback(context.Background(), result, err)
		}
	}()
}

// Stop 停止队列服务
func Stop() error {
	logger.Info("正在停止消息队列")
	mu.Lock()
	clear(handlerMap)
	mu.Unlock()
	return nil
}

// GetInstance 获取队列实例（返回 nil，因为使用内存直接处理模式）
func GetInstance() interface{} {
	return nil
}

// GenerateScriptMessage 生成剧本生成消息
func GenerateScriptMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("script_%d", time.Now().UnixNano()),
		Type:       MessageTypeGenerateScript,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}

// SplitStoryboardMessage 生成分镜拆分消息
func SplitStoryboardMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("storyboard_%d", time.Now().UnixNano()),
		Type:       MessageTypeSplitStoryboard,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}

// GenerateImageMessage 生成图像生成消息
func GenerateImageMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("img_%d", time.Now().UnixNano()),
		Type:       MessageTypeGenerateImage,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}

// GenerateVideoMessage 生成视频生成消息
func GenerateVideoMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("video_%d", time.Now().UnixNano()),
		Type:       MessageTypeGenerateVideo,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}

// MergeVideoMessage 生成视频合并消息
func MergeVideoMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("merge_%d", time.Now().UnixNano()),
		Type:       MessageTypeMergeVideo,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}

// PublishVideoMessage 生成视频发布消息
func PublishVideoMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("publish_%d", time.Now().UnixNano()),
		Type:       MessageTypePublishVideo,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}

// GenerateWorkflowMessage 生成工作流消息
func GenerateWorkflowMessage(data map[string]interface{}) *QueueMessage {
	return &QueueMessage{
		ID:         fmt.Sprintf("workflow_%d", time.Now().UnixNano()),
		Type:       MessageTypeWorkflow,
		Data:       data,
		Timestamp:  time.Now().Unix(),
		RetryCount: 0,
	}
}
