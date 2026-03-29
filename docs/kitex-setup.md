# Kitex 安装和使用指南

## 安装 Kitex

### 方式一：直接安装
```bash
go install github.com/cloudwego/kitex/tool/cmd/kitex@latest
```

### 方式二：使用 cwgo 工具链（推荐）
```bash
# 安装 cwgo
git clone --depth=1 https://github.com/cloudwego/cwgo.git $GOPATH/src/github.com/cloudwego/cwgo
cd $GOPATH/src/github.com/cloudwego/cwgo
go install ./cwgo
```

## 确认安装

```bash
# 确保 GOPATH/bin 在 PATH 中
export PATH=$PATH:$(go env GOPATH)/bin

# 验证安装
kitex --version
```

## 生成 Kitex 代码

### 生成所有服务的 Kitex 代码

```bash
# 切换到项目根目录
cd /Users/figo/GolandProjects/Dora-Project-1

# 生成 Script Service
kitex -module github.com/dora-magic-box -service script-service \
  idl/thrift/script.thrift

# 生成 Storyboard Service
kitex -module github.com/dora-magic-box -service storyboard-service \
  idl/thrift/storyboard.thrift

# 生成 Image Service
kitex -module github.com/dora-magic-box -service image-service \
  idl/thrift/image.thrift

# 生成 Video Service
kitex -module github.com/dora-magic-box -service video-service \
  idl/thrift/video.thrift

# 生成 Merge Service
kitex -module github.com/dora-magic-box -service merge-service \
  idl/thrift/merge.thrift

# 生成 Model Service
kitex -module github.com/dora-magic-box -service model-service \
  idl/thrift/model.thrift
```

### 批量生成

```bash
make thrift
```

## 生成的文件结构

```
idl/
└── kitex_gen/
    ├── script/           # Script Service 生成代码
    │   ├── scriptservice/
    │   │   ├── scriptservice.go
    │   │   ├── client.go
    │   │   └── invoker.go
    │   └── script.go
    ├── storyboard/       # Storyboard Service 生成代码
    ├── image/           # Image Service 生成代码
    ├── video/           # Video Service 生成代码
    ├── merge/           # Merge Service 生成代码
    └── model/           # Model Service 生成代码
```

## Kitex 常用命令参数

| 参数 | 说明 |
|------|------|
| `-module` | Go 模块名 |
| `-service` | 服务名（服务端代码） |
| `-I` | IDL 文件目录 |
| `-proto` | 使用 protobuf |

## 注意事项

1. 确保 GOPATH/bin 在 PATH 环境变量中
2. IDL 文件中的 include 路径要正确相对路径
3. 使用相同的 module 名称，避免包冲突
