# Dora 魔盒 - Makefile

.PHONY: all build clean test run lint fmt proto help

# 默认目标
all: build

# 帮助信息
help:
	@echo "Dora 魔盒 - 可用命令:"
	@echo "  make build          - 构建所有服务"
	@echo "  make clean          - 清理构建产物"
	@echo "  make test           - 运行测试"
	@echo "  make lint           - 运行代码检查"
	@echo "  make fmt            - 格式化代码"
	@echo "  make proto          - 生成 proto 文件"
	@echo "  make thrift         - 生成 thrift 文件"
	@echo "  make run-gateway    - 运行 API Gateway"
	@echo "  make run-services   - 运行所有微服务"
	@echo "  make docker-build   - 构建 Docker 镜像"
	@echo "  make docker-compose - 使用 Docker Compose 启动"

# 构建所有服务
build:
	@echo "构建所有服务..."
	@mkdir -p bin
	@go build -o bin/api-gateway ./cmd/api-gateway
	@go build -o bin/script-service ./cmd/script-service
	@go build -o bin/storyboard-service ./cmd/storyboard-service
	@go build -o bin/image-service ./cmd/image-service
	@go build -o bin/video-service ./cmd/video-service
	@go build -o bin/merge-service ./cmd/merge-service
	@go build -o bin/workflow-service ./cmd/workflow-service
	@go build -o bin/model-service ./cmd/model-service
	@echo "构建完成"

# 清理
clean:
	@echo "清理构建产物..."
	@rm -rf bin/
	@echo "清理完成"

# 测试
test:
	@echo "运行测试..."
	@go test -v ./...

# 代码检查
lint:
	@echo "运行代码检查..."
	@golangci-lint run ./...

# 格式化代码
fmt:
	@echo "格式化代码..."
	@go fmt ./...
	@goimports -w .

# 生成 proto 文件
proto:
	@echo "生成 proto 文件..."
	@protoc --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		idl/proto/*.proto

# 生成 thrift 文件
thrift:
	@echo "生成 thrift 文件..."
	@kitex -module github.com/dora-magic-box idl/thrift/*.thrift

# 运行 API Gateway
run-gateway:
	@echo "运行 API Gateway..."
	@./bin/api-gateway

# 运行所有微服务
run-services:
	@echo "运行所有微服务..."
	@./bin/script-service &
	@./bin/storyboard-service &
	@./bin/image-service &
	@./bin/video-service &
	@./bin/merge-service &
	@./bin/workflow-service &
	@./bin/model-service &

# Docker 构建
docker-build:
	@echo "构建 Docker 镜像..."
	@docker-compose -f deployments/docker-compose/docker-compose.yml build

# Docker Compose
docker-compose:
	@echo "使用 Docker Compose 启动..."
	@docker-compose -f deployments/docker-compose/docker-compose.yml up -d

# 下载依赖
deps:
	@echo "下载依赖..."
	@go mod download
	@go mod tidy
