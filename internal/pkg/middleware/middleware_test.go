package middleware

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestResponse 测试Response结构体
func TestResponse(t *testing.T) {
	t.Run("TestResponseFields", func(t *testing.T) {
		resp := Response{
			Code:    CodeSuccess,
			Message: "success",
			Data:    map[string]string{"key": "value"},
		}

		assert.Equal(t, CodeSuccess, resp.Code)
		assert.Equal(t, "success", resp.Message)
		assert.NotNil(t, resp.Data)
	})

	t.Run("TestResponseWithoutData", func(t *testing.T) {
		resp := Response{
			Code:    CodeSuccess,
			Message: "success",
		}

		assert.Equal(t, CodeSuccess, resp.Code)
		assert.Equal(t, "success", resp.Message)
		assert.Nil(t, resp.Data)
	})
}

// TestResponseCodeConstants 测试响应码常量
func TestResponseCodeConstants(t *testing.T) {
	assert.Equal(t, 0, CodeSuccess)
	assert.Equal(t, 400, CodeBadRequest)
	assert.Equal(t, 401, CodeUnauthorized)
	assert.Equal(t, 403, CodeForbidden)
	assert.Equal(t, 404, CodeNotFound)
	assert.Equal(t, 500, CodeInternalServerError)
}

// TestResponseJSONStructure 测试响应JSON结构
func TestResponseJSONStructure(t *testing.T) {
	resp := Response{
		Code:    CodeSuccess,
		Message: "success",
		Data: map[string]interface{}{
			"id":   1,
			"name": "test",
		},
	}

	jsonData, err := json.Marshal(resp)
	assert.Nil(t, err)
	assert.True(t, len(jsonData) > 0)

	// 验证JSON可以正确解析
	var parsed Response
	err = json.Unmarshal(jsonData, &parsed)
	assert.Nil(t, err)
	assert.Equal(t, resp.Code, parsed.Code)
	assert.Equal(t, resp.Message, parsed.Message)
}

// TestResponseWithBuffer 测试响应缓冲数据
func TestResponseWithBuffer(t *testing.T) {
	resp := Response{
		Code:    CodeSuccess,
		Message: "success",
	}

	var buf bytes.Buffer
	err := json.NewEncoder(&buf).Encode(resp)
	assert.Nil(t, err)
	assert.True(t, buf.Len() > 0)
}

// TestMiddlewareConstructors 测试中间件构造函数不panic
func TestMiddlewareConstructors(t *testing.T) {
	// 测试 Logger 中间件构造函数不会panic
	assert.NotPanics(t, func() {
		_ = Logger()
	})

	// 测试 Recovery 中间件构造函数不会panic
	assert.NotPanics(t, func() {
		_ = Recovery()
	})

	// 测试 Cors 中间件构造函数不会panic
	assert.NotPanics(t, func() {
		_ = Cors()
	})
}
