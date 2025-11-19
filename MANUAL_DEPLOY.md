# 手动部署指南（当网络克隆失败时）

## 📦 手动上传项目文件

### 方法一：使用SCP上传
```bash
# 在本地机器上执行，将整个项目上传到服务器
scp -r /path/to/tools root@你的服务器IP:/var/www/
```

### 方法二：使用FTP工具上传
使用FileZilla、WinSCP等工具将项目文件上传到：
- 服务器路径：`/var/www/web-toolkit/`
- 上传整个项目文件夹内容

### 方法三：使用git bundle（离线克隆）
```bash
# 在有网络的机器上
cd /path/to/tools
git bundle create web-toolkit.bundle --all

# 上传bundle文件到服务器后
git clone web-toolkit.bundle .
```

### 方法四：下载ZIP文件
```bash
# 在服务器上直接下载
cd /var/www/
wget https://github.com/mozhi509/tools/archive/refs/heads/main.zip
unzip main.zip
mv tools-main web-toolkit
cd web-toolkit
```

## 🚀 上传完成后执行

1. **给脚本执行权限**
   ```bash
   chmod +x deploy-local.sh
   ```

2. **执行本地部署**
   ```bash
   ./deploy-local.sh
   ```

## ✅ 验证部署成功
- 访问: http://你的服务器IP
- 检查: `pm2 status`
- 日志: `pm2 logs web-toolkit`

## 🔧 如果还是有问题

可以分步手动部署：

### 1. 安装环境
```bash
# OpenCloudOS安装Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs nginx git

# 安装PM2
npm install -g pm2
```

### 2. 安装依赖
```bash
npm install
cd client && npm install && npm run build && cd ..
```

### 3. 启动服务
```bash
# 启动Node.js服务
pm2 start server/index.js --name web-toolkit

# 配置并启动Nginx
# (手动创建配置文件或使用deploy-local.sh中的配置)
```