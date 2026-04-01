# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY web/package.json web/package-lock.json ./
RUN npm ci

# 复制源代码并构建
COPY web/ ./
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制构建好的前端文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY deployments/docker/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 3000

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
