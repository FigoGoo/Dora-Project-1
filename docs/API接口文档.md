---
name: API接口文档
description: Dora 魔盒 API 接口详细文档
type: project
---

# Dora 魔盒 API 接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | API 接口文档 |
| 版本 | v1.0 |
| 创建日期 | 2026-03-30 |
| 状态 | 初稿 |

---

## 一、接口基础信息

### 1.1 接口地址

- **开发环境**: `http://localhost:8080`
- **生产环境**: `https://api.dorabox.com`

### 1.2 通用请求头

```http
Authorization: Bearer {token}  // JWT Token
Content-Type: application/json
User-Agent: DoraClient/1.0
```

### 1.3 通用响应格式

#### 成功响应
```json
{
    "code": 200,
    "msg": "success",
    "data": {} // 具体数据
}
```

#### 错误响应
```json
{
    "code": 500,
    "msg": "Internal Server Error",
    "data": null
}
```

### 1.4 错误码说明

| 错误码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源未找到 |
| 429 | 请求频率过高 |
| 500 | 服务器内部错误 |

---

## 二、用户接口

### 2.1 用户注册

```http
POST /api/v1/user/register
Content-Type: application/json

{
    "username": "string",     // 用户名 (3-20位)
    "email": "string",        // 邮箱
    "password": "string",     // 密码 (6-20位)
    "nickname": "string"      // 昵称 (可选)
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "user_id": 1001,
        "username": "testuser",
        "email": "test@example.com",
        "nickname": "Test User"
    }
}
```

### 2.2 用户登录

```http
POST /api/v1/user/login
Content-Type: application/json

{
    "email": "string",
    "password": "string"
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "user_id": 1001,
            "username": "testuser",
            "email": "test@example.com"
        }
    }
}
```

### 2.3 获取用户信息

```http
GET /api/v1/user/profile
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "user_id": 1001,
        "username": "testuser",
        "email": "test@example.com",
        "nickname": "Test User",
        "avatar": "https://example.com/avatar.jpg"
    }
}
```

---

## 三、项目管理接口

### 3.1 创建项目

```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "string",
    "description": "string",
    "duration": 60,
    "tags": ["tag1", "tag2"]
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "1001",
        "title": "我的第一个视频项目",
        "description": "这是一个测试项目",
        "status": "pending",
        "created_at": "2026-03-30T10:00:00Z"
    }
}
```

### 3.2 获取项目列表

```http
GET /api/v1/projects?page=1&page_size=10&status=pending
Authorization: Bearer {token}
```

**查询参数**：
- `page`：页码（默认1）
- `page_size`：每页数量（默认10）
- `status`：项目状态（可选）

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "total": 15,
        "page": 1,
        "page_size": 10,
        "list": [
            {
                "id": "1001",
                "title": "我的第一个视频项目",
                "description": "这是一个测试项目",
                "status": "pending",
                "created_at": "2026-03-30T10:00:00Z"
            }
        ]
    }
}
```

### 3.3 获取项目详情

```http
GET /api/v1/projects/:id
Authorization: Bearer {token}
```

**路径参数**：
- `id`：项目ID

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "1001",
        "title": "我的第一个视频项目",
        "description": "这是一个测试项目",
        "status": "pending",
        "duration": 60,
        "tags": ["tag1", "tag2"],
        "cover_image": "https://example.com/cover.jpg",
        "progress": 0,
        "created_at": "2026-03-30T10:00:00Z"
    }
}
```

### 3.4 更新项目

```http
PUT /api/v1/projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "string",
    "description": "string",
    "tags": ["tag1"]
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": null
}
```

### 3.5 删除项目

```http
DELETE /api/v1/projects/:id
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": null
}
```

---

## 四、剧本生成接口

### 4.1 生成剧本

```http
POST /api/v1/projects/:id/scripts
Authorization: Bearer {token}
Content-Type: application/json

{
    "inspiration": "string",      // 灵感描述
    "style": "string",            // 剧本风格 (comedy/education/marketing等)
    "duration": 60                // 目标时长(秒)
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "2001",
        "content": "剧本内容...",
        "model": "deepseek",
        "status": "processing",
        "task_id": "task_1234"
    }
}
```

### 4.2 获取剧本

```http
GET /api/v1/scripts/:id
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "2001",
        "content": "剧本内容...",
        "model": "deepseek",
        "status": "completed",
        "version": 1,
        "created_at": "2026-03-30T10:00:00Z"
    }
}
```

---

## 五、分镜拆解接口

### 5.1 拆分解镜

```http
POST /api/v1/scripts/:id/storyboards
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "task_id": "task_5678",
        "status": "processing"
    }
}
```

### 5.2 获取分镜列表

```http
GET /api/v1/projects/:id/storyboards
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "list": [
            {
                "id": "3001",
                "sequence": 1,
                "description": "镜头1描述",
                "prompt": "AI生成的绘图提示词",
                "duration": 10,
                "camera_movement": "zoom_in",
                "dialogue": "台词内容"
            }
        ]
    }
}
```

### 5.3 更新分镜

```http
PUT /api/v1/storyboards/:id
Authorization: Bearer {token}
Content-Type: application/json

{
    "prompt": "string",
    "duration": 10,
    "camera_movement": "zoom_in"
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": null
}
```

---

## 六、画面绘制接口

### 6.1 生成画面

```http
POST /api/v1/storyboards/:id/images
Authorization: Bearer {token}
Content-Type: application/json

{
    "prompt": "string"
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "task_id": "task_9012",
        "status": "processing"
    }
}
```

### 6.2 获取画面列表

```http
GET /api/v1/storyboards/:id/images
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "list": [
            {
                "id": "4001",
                "url": "https://example.com/image.jpg",
                "prompt": "提示词",
                "model": "banana",
                "status": "completed",
                "is_selected": true,
                "width": 1024,
                "height": 768
            }
        ]
    }
}
```

### 6.3 选择画面

```http
PUT /api/v1/images/:id/select
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": null
}
```

---

## 七、视频生成接口

### 7.1 生成视频

```http
POST /api/v1/storyboards/:id/videos
Authorization: Bearer {token}
Content-Type: application/json

{
    "motion_type": "zoom_in",
    "fps": 24
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "task_id": "task_3456",
        "status": "processing"
    }
}
```

### 7.2 获取视频

```http
GET /api/v1/videos/:id
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "5001",
        "url": "https://example.com/video.mp4",
        "model": "seedance",
        "status": "completed",
        "duration": 10,
        "width": 1920,
        "height": 1080,
        "fps": 24
    }
}
```

---

## 八、视频拼接接口

### 8.1 合并视频

```http
POST /api/v1/projects/:id/merge
Authorization: Bearer {token}
Content-Type: application/json

{
    "format": "mp4",
    "resolution": "1080p"
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "task_id": "task_7890",
        "status": "processing"
    }
}
```

### 8.2 下载视频

```http
GET /api/v1/videos/:id/download
Authorization: Bearer {token}
```

**响应**：
```http
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="video.mp4"
```

---

## 九、视频发布接口

### 9.1 授权发布平台

```http
POST /api/v1/user/authorize
Authorization: Bearer {token}
Content-Type: application/json

{
    "platform": "douyin",
    "auth_code": "code_1234"
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": null
}
```

### 9.2 发布视频

```http
POST /api/v1/videos/:id/publish
Authorization: Bearer {token}
Content-Type: application/json

{
    "platform": "douyin",
    "title": "视频标题",
    "description": "视频描述",
    "tags": ["tag1", "tag2"],
    "cover_image": "https://example.com/cover.jpg"
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "publish_id": "pub_1234",
        "status": "processing"
    }
}
```

### 9.3 获取发布状态

```http
GET /api/v1/publish/:id/status
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "pub_1234",
        "status": "completed",
        "platform": "douyin",
        "url": "https://douyin.com/video/123456"
    }
}
```

---

## 十、模型管理接口

### 10.1 获取模型列表

```http
GET /api/v1/models?type=text
Authorization: Bearer {token}
```

**查询参数**：
- `type`：模型类型 (text/image/video)

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "list": [
            {
                "name": "deepseek",
                "type": "text",
                "provider": "deepseek",
                "description": "DeepSeek 文本模型",
                "enabled": true
            }
        ]
    }
}
```

### 10.2 配置自定义模型

```http
POST /api/v1/user/models
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "my_custom_model",
    "type": "text",
    "provider": "custom",
    "endpoint": "https://api.example.com",
    "params": {
        "api_key": "abc123"
    }
}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "6001",
        "name": "my_custom_model"
    }
}
```

---

## 十一、任务查询接口

### 11.1 查询任务状态

```http
GET /api/v1/tasks/:id
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": "task_1234",
        "type": "script",
        "status": "completed",
        "progress": 100,
        "message": "生成成功"
    }
}
```

### 11.2 获取任务列表

```http
GET /api/v1/tasks?page=1&page_size=10
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "list": [
            {
                "id": "task_1234",
                "type": "script",
                "status": "completed",
                "created_at": "2026-03-30T10:00:00Z"
            }
        ]
    }
}
```

---

## 十二、用量统计接口

### 12.1 获取用量信息

```http
GET /api/v1/usage
Authorization: Bearer {token}
```

**响应**：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "script_count": 5,
        "image_count": 20,
        "video_duration": 600,
        "storage_used": 104857600
    }
}
```

---

## 十三、系统接口

### 13.1 健康检查

```http
GET /health
```

**响应**：
```json
{
    "status": "healthy",
    "timestamp": "2026-03-30T10:00:00Z"
}
```

---

## 十四、错误处理接口

### 14.1 错误响应格式

```json
{
    "code": 400,
    "msg": "参数验证失败",
    "data": {
        "errors": [
            {
                "field": "inspiration",
                "message": "灵感描述不能为空"
            }
        ]
    }
}
```

### 14.2 常见错误场景

| 错误码 | 场景 | 处理方式 |
|--------|------|---------|
| 400 | 参数验证失败 | 检查请求参数格式 |
| 401 | 未授权 | 重新登录 |
| 403 | 权限不足 | 升级套餐 |
| 429 | 频率限制 | 稍后重试 |
| 500 | 服务器错误 | 联系客服 |

---

## 十五、API接口测试方案

### 15.1 测试策略

#### 15.1.1 接口覆盖率
- 所有核心接口需要覆盖
- 重点接口需要覆盖多种场景
- 错误处理场景需要覆盖

#### 15.1.2 测试工具
- **接口测试**: Postman/Newman
- **自动化测试**: Playwright + API 测试
- **性能测试**: k6/wrk

### 15.2 测试场景设计

#### 15.2.1 参数验证测试

**测试点**:
1. 必填参数缺失
2. 参数格式错误
3. 参数长度超限
4. 参数类型错误

**示例**:
```
接口: /api/v1/user/register
测试场景: 用户名少于3位、邮箱格式错误、密码少于6位
```

#### 15.2.2 响应数据验证

**测试点**:
1. 响应结构正确性
2. 字段类型验证
3. 字段内容合理性
4. 业务规则验证

**示例**:
```
接口: /api/v1/projects/:id
验证: id是否为整数、status是否符合枚举值、created_at格式是否正确
```

#### 15.2.3 错误处理测试

**测试点**:
1. 无效Token
2. 无权限访问
3. 资源不存在
4. 业务状态错误

**示例**:
```
接口: /api/v1/projects/9999
验证: 应该返回404，提示资源不存在
```

#### 15.2.4 边界条件测试

**测试点**:
1. 最大数据量
2. 最小数据量
3. 边界值验证

**示例**:
```
接口: /api/v1/projects
测试场景: page=1&page_size=10000 (超大分页)
```

#### 15.2.5 性能测试

**测试点**:
1. 接口响应时间
2. 并发处理能力
3. 资源使用情况

**示例**:
```
接口: /api/v1/projects/:id/scripts
测试场景: 100并发用户同时生成剧本
```

---

## 十六、接口变更记录

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2026-03-30 | 初始版本，包含所有核心接口 |

---

## 十七、文档维护

### 17.1 更新流程

1. 接口变更需要同步更新文档
2. 文档更新需要经过代码审核流程
3. 版本号需要递增

### 17.2 反馈机制

如有接口问题或文档改进建议，请通过以下方式反馈：
- 提交 issue
- 联系开发团队
- 内部沟通群

---

## 十八、参考文档

- [产品需求文档](./产品需求文档.md)
- [系统架构设计](./系统架构.md)
- [测试计划](./测试计划.md)
