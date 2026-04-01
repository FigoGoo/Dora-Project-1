# Docker 本地启动文档

## 前置要求

1. 安装 Docker Desktop（Mac/Windows）或 Docker Engine（Linux）
2. 安装 Docker Compose（通常随 Docker Desktop 一起安装）
3. 确保 Docker 服务正在运行
4. 确保有足够的磁盘空间（至少 5GB）

## 项目结构

```
dora-magic-box/
├── deployments/
│   ├── docker-compose/
│   │   ├── .env                    # 环境变量配置
│   │   ├── docker-compose.yml         # 基础服务配置（仅基础设施）
│   │   └── docker-compose-full.yml    # 完整服务配置（包含所有服务）
│   └── docker/
│       ├── gateway.Dockerfile         # API Gateway 镜像
│       ├── script-service.Dockerfile   # 剧本服务镜像
│       ├── storyboard-service.Dockerfile # 分镜服务镜像
│       ├── image-service.Dockerfile    # 画面服务镜像
│       ├── video-service.Dockerfile    # 视频服务镜像
│       ├── merge-service.Dockerfile    # 视频拼接服务镜像
│       ├── model-service.Dockerfile    # 模型服务镜像
│       ├── workflow-service.Dockerfile  # 工作流服务镜像
│       ├── frontend.Dockerfile        # 前端服务镜像
│       └── nginx.conf               # Nginx 配置
├── cmd/                          # 各服务的 Go 入口文件
├── web/                          # 前端 React 项目
└── go.mod, go.sum                 # Go 依赖管理
```

## 服务说明

### 基础设施服务

| 服务 | 端口 | 说明 |
|------|------|------|
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| MinIO API | 9000 | 对象存储 API |
| MinIO Console | 9001 | 对象存储管理控制台 |
| RocketMQ NameServer | 9876 | 消息队列命名服务器 |
| RocketMQ Broker | 10909, 10911 | 消息队列代理 |

### 应用服务

| 服务 | 端口 | 说明 |
|------|------|------|
| API Gateway | 8080 | API 网关 |
| Script Service | 8881 | 剧本生成服务 |
| Storyboard Service | 8882 | 分镜拆解服务 |
| Image Service | 8883 | 画面绘制服务 |
| Video Service | 8884 | 视频生成服务 |
| Merge Service | 8885 | 视频拼接服务 |
| Model Service | 8886 | 模型管理服务 |
| Workflow Service | 8887 | 工作流服务 |
| Frontend | 3000 | 前端 Web 应用 |

## 快速启动

### 1. 仅启动基础设施（适用于本地开发）

```bash
cd deployments/docker-compose

# 启动基础设施服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 2. 启动所有服务（完整环境）

```bash
cd deployments/docker-compose

# 加载环境变量
source .env

# 启动所有服务
docker-compose -f docker-compose-full.yml up -d

# 查看服务状态
docker-compose -f docker-compose-full.yml ps

# 查看日志
docker-compose -f docker-compose-full.yml logs -f
```

## 详细操作步骤

### 步骤 1：准备环境变量

```bash
cd deployments/docker-compose

# 查看环境变量配置
cat .env

# 如需修改，编辑 .env 文件
vim .env
```

**环境变量说明：**

- `MYSQL_ROOT_PASSWORD`: MySQL 数据库 root 密码
- `MINIO_ROOT_USER`: MinIO 管理员用户名
- `MINIO_ROOT_PASSWORD`: MinIO 管理员密码

### 步骤 2：构建镜像（首次运行）

```bash
cd deployments/docker-compose

# 构建所有服务镜像
docker-compose -f docker-compose-full.yml build

# 或构建单个服务
docker-compose -f docker-compose-full.yml build api-gateway
```

### 步骤 3：启动服务

```bash
# 启动所有服务
docker-compose -f docker-compose-full.yml up -d

# 等待所有服务启动完成（约 2-5 分钟）
docker-compose -f docker-compose-full.yml ps
```

### 步骤 4：验证服务状态

```bash
# 检查所有服务是否正常运行
docker-compose -f docker-compose-full.yml ps

# 应该看到所有服务的状态都是 "Up"
```

### 步骤 5：访问服务

| 服务 | 访问地址 |
|------|---------|
| 前端应用 | http://localhost:3000 |
| MinIO 控制台 | http://localhost:9001 (用户名/密码: minioadmin) |
| API Gateway | http://localhost:8080 |

## 常用操作

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose-full.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose-full.yml logs -f api-gateway
docker-compose -f docker-compose-full.yml logs -f mysql
```

### 停止服务

```bash
# 停止所有服务（保留数据）
docker-compose -f docker-compose-full.yml stop

# 停止特定服务
docker-compose -f docker-compose-full.yml stop api-gateway
```

### 启动已停止的服务

```bash
docker-compose -f docker-compose-full.yml start
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose-full.yml restart

# 重启特定服务
docker-compose -f docker-compose-full.yml restart api-gateway
```

### 删除服务（保留数据）

```bash
docker-compose -f docker-compose-full.yml down
```

### 删除服务和数据（完全清理）

```bash
docker-compose -f docker-compose-full.yml down -v
```

### 清理未使用的 Docker 资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 一次性清理所有未使用资源
docker system prune -a --volumes
```

## 故障排查

### 问题 1：服务无法启动

```bash
# 查看服务日志
docker-compose -f docker-compose-full.yml logs <service-name>

# 检查服务依赖
docker-compose -f docker-compose-full.yml config
```

### 问题 2：端口被占用

```bash
# 检查端口占用
lsof -i :3000
lsof -i :8080
lsof -i :3306

# 停止占用端口的进程或修改 docker-compose.yml 中的端口映射
```

### 问题 3：数据库连接失败

```bash
# 检查 MySQL 服务状态
docker-compose -f docker-compose-full.yml ps mysql

# 查看 MySQL 日志
docker-compose -f docker-compose-full.yml logs mysql

# 手动连接 MySQL
docker exec -it dora-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD}
```

### 问题 4：构建失败

```bash
# 清理构建缓存
docker-compose -f docker-compose-full.yml build --no-cache

# 查看构建日志
docker-compose -f docker-compose-full.yml build --progress=plain
```

## 健康检查

```bash
# 检查服务健康状态
docker-compose -f docker-compose-full.yml ps

# 进入容器检查
docker exec -it dora-api-gateway sh
docker exec -it dora-mysql bash
docker exec -it dora-redis sh
```

## 性能监控

```bash
# 查看 Docker 资源使用情况
docker stats

# 查看特定容器资源使用
docker stats dora-api-gateway
```

## 数据备份

### 备份 MySQL 数据

```bash
# 创建备份
docker exec dora-mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} dora_magic_box > backup.sql

# 恢复备份
docker exec -i dora-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} dora_magic_box < backup.sql
```

### 备份 Redis 数据

```bash
# 备份 Redis 数据
docker exec dora-redis redis-cli BGSAVE

# 查看 Redis 数据
docker exec dora-redis redis-cli KEYS '*'
```

### 备份 MinIO 数据

MinIO 数据存储在 Docker volume `minio-data` 中，可以通过 Docker volume 进行备份。

```bash
# 查看 MinIO 数据卷
docker volume ls | grep minio

# 备份数据卷
docker run --rm -v minio-data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

## 生产环境配置

在生产环境中，建议：

1. **修改环境变量**：
   - 使用强密码替换默认密码
   - 配置真实的域名和 SSL 证书

2. **使用外部服务**：
   - 使用云数据库（如 RDS）
   - 使用云存储（如 S3）
   - 使用云消息队列（如 RocketMQ Cloud）

3. **配置监控和日志**：
   - 集成 Prometheus 监控
   - 集成 ELK 日志收集

4. **配置安全**：
   - 使用非 root 用户运行容器
   - 配置网络隔离
   - 启用 HTTPS

## 注意事项

1. 首次启动需要构建镜像，耗时较长（10-30 分钟）
2. 确保网络连接正常，需要拉取基础镜像
3. 修改代码后需要重新构建镜像
4. 生产环境请使用独立的配置文件
5. 定期备份数据库和对象存储数据

## 相关文档

- [系统架构](../docs/系统架构.md)
- [产品需求文档](../docs/产品需求文档.md)
- [API 接口文档](../docs/API接口文档.md)
- [测试计划](../docs/测试计划.md)

## 获取帮助

如遇到问题，可以：

1. 查看服务日志
2. 检查 Docker 文档：https://docs.docker.com/
3. 查看 Docker Compose 文档：https://docs.docker.com/compose/
4. 联系开发团队
