package middleware

import (
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

// 响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// 常用响应码
const (
	CodeSuccess     = 0
	CodeBadRequest  = 400
	CodeUnauthorized = 401
	CodeForbidden   = 403
	CodeNotFound    = 404
	CodeInternalServerError = 500
)

// Success 成功响应
func Success(c *app.RequestContext, data interface{}) {
	c.JSON(consts.StatusOK, Response{
		Code:    CodeSuccess,
		Message: "success",
		Data:    data,
	})
}

// Error 错误响应
func Error(c *app.RequestContext, code int, message string) {
	c.JSON(consts.StatusOK, Response{
		Code:    code,
		Message: message,
	})
}

// BadRequest 400错误
func BadRequest(c *app.RequestContext, message string) {
	Error(c, CodeBadRequest, message)
}

// Unauthorized 401错误
func Unauthorized(c *app.RequestContext, message string) {
	Error(c, CodeUnauthorized, message)
}

// Forbidden 403错误
func Forbidden(c *app.RequestContext, message string) {
	Error(c, CodeForbidden, message)
}

// NotFound 404错误
func NotFound(c *app.RequestContext, message string) {
	Error(c, CodeNotFound, message)
}

// InternalError 500错误
func InternalError(c *app.RequestContext, message string) {
	Error(c, CodeInternalServerError, message)
}
