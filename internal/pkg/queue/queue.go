package queue

import "context"

// Queue 通用队列接口
type Queue interface {
	// SendMessage 发送同步消息
	SendMessage(topic string, msg *QueueMessage) error
	// SendMessageAsync 发送异步消息
	SendMessageAsync(topic string, msg *QueueMessage, callback func(context.Context, *SendResult, error))
	// StartConsumer 启动消费者
	StartConsumer(topic string, handler func(*QueueMessage) error) error
	// Stop 停止队列
	Stop() error
}

// SendResult 发送结果
type SendResult struct {
	MsgID       string
	Status      string
	QueueID     int32
	QueueOffset int64
}
