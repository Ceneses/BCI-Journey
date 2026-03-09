# 第一阶段：构建阶段
FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（或 yarn.lock）
COPY package*.json ./

# 安装依赖（使用 npm，如果你用 yarn/pnpm 可以替换）
RUN npm ci --only=production

# 复制项目所有源代码
COPY . .

# 构建生产环境代码
RUN npm run build

# 第二阶段：运行阶段（使用轻量级的 nginx 镜像）
FROM nginx:alpine

# 从构建阶段复制打包后的文件到 nginx 的静态资源目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置（可选，解决前端路由问题）
# 如果需要自定义配置，创建 nginx.conf 文件并取消下面注释
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]