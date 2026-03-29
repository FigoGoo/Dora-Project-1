# Dora 魔盒

基于 CloudWeGo 全家桶的 AI 视频内容生成 SaaS 平台。

## 功能流程

灵感输入 → 剧本生成 → 分镜拆解 → 画面绘制 → 视频生成 → 视频拼接 → 视频下载 → 视频发布

## 技术栈

- **框架**: CloudWeGo (Hertz + Kitex)
- **数据库**: MySQL + GORM
- **缓存**: Redis
- **对象存储**: MinIO
- **消息队列**: RocketMQ
- **文本模型**: DeepSeek、Gemini 3.1 pro
- **图片模型**: Banana 2
- **视频模型**: Seedance
- **视频拼接**: FFmpeg

## 项目结构

```
dora-magic-box/
├── cmd/                    # 应用入口
│   ├── api-gateway/        # API Gateway 服务
│   ├── script-service/      # 剧本生成服务
│   ├── storyboard-service/  # 分镜拆解服务
│   ├── image-service/       # 画面绘制服务
│   ├── video-service/       # 视频生成服务
│   ├── merge-service/       # 视频拼接服务
│   └── model-service/       # 模型管理服务
├── internal/               # 内部包
│   ├── api/                # API 层
│   ├── biz/                # 业务逻辑层
│   ├── dal/                # 数据访问层
│   └── pkg/                # 共享包
├── idl/                    # 接口定义
│   └── thrift/             # Thrift IDL
├── configs/                # 配置文件
└── deployments/            # 部署文件
```

## 快速开始

### 使用 Docker Compose

```bash
# 构建并启动所有服务
make docker-compose

# 查看日志
docker-compose -f deployments/docker-compose/docker-compose.yml logs -f
```

### 本地开发

```bash
# 安装依赖
make deps

# 生成 Thrift 文件
make thrift

# 构建
make build

# 运行 API Gateway
make run-gateway

# 运行所有微服务
make run-services
```

## API 文档

### 健康检查
- `GET /health`

### 项目管理
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects/:id` - 获取项目
- `GET /api/v1/projects` - 列出项目
- `DELETE /api/v1/projects/:id` - 删除项目

### 剧本生成
- `POST /api/v1/projects/:id/scripts` - 生成剧本
- `GET /api/v1/scripts/:id` - 获取剧本

### 分镜拆解
- `POST /api/v1/scripts/:id/storyboards` - 拆解分镜
- `GET /api/v1/projects/:id/storyboards` - 获取分镜列表

### 画面绘制
- `POST /api/v1/storyboards/:id/images` - 生成画面
- `GET /api/v1/images/:id` - 获取画面

### 视频生成
- `POST /api/v1/storyboards/:id/videos` - 生成视频
- `GET /api/v1/videos/:id` - 获取视频

### 视频合并
- `POST /api/v1/projects/:id/merge` - 合并视频
- `GET /api/v1/videos/:id/download` - 下载视频
- `POST /api/v1/videos/:id/publish` - 发布视频

## 配置说明

配置文件位于 `configs/config.yaml`，包含以下配置项：

- `app`: 应用配置
- `server`: 服务器配置
- `mysql`: MySQL 数据库配置
- `redis`: Redis 缓存配置
- `minio`: MinIO 对象存储配置
- `rocketmq`: RocketMQ 消息队列配置

## 开发规范

1. 所有代码变更必须记录日志
2. 所有代码变更、文档变更、bug修复都要提交 GitHub
3. 遵循 Go 代码规范
4. 使用 Thrift 定义服务接口

## 许可证

MIT License
