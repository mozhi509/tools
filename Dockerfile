# 使用官方Node.js 18 Alpine镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY package*.json ./
COPY client/package*.json ./client/

# 安装依赖
RUN npm ci --only=production && \
    cd client && npm ci --only=production

# 复制项目文件
COPY . .

# 构建客户端
RUN cd client && npm run build

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 使用PM2运行应用
RUN npm install -g pm2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]