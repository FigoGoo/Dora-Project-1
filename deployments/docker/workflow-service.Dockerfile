FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装依赖
RUN apk add --no-cache git

# 复制依赖文件
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 编译 Workflow Service
RUN CGO_ENABLED=0 GOOS=linux go build -o workflow-service cmd/workflow-service/main.go

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 安装必要的运行时依赖
RUN apk --no-cache add ca-certificates tzdata

# 设置时区
ENV TZ=Asia/Shanghai

# 复制编译好的二进制文件
COPY --from=builder /app/workflow-service /app/

# 暴露端口
EXPOSE 8887

# 启动应用
CMD ["/app/workflow-service"]
