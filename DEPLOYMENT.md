# 腾讯云轻量级服务器部署指南

## 🚀 快速部署

### 方法一：一键部署脚本（推荐）

1. **连接服务器**
   ```bash
   ssh root@你的服务器IP
   ```

2. **下载并执行部署脚本**
   ```bash
   # 下载项目
   git clone https://github.com/mozhi509/tools.git
   cd tools
   
   # 给脚本执行权限
   chmod +x deploy.sh
   
   # 执行一键部署
   ./deploy.sh
   ```

### 方法二：手动部署

1. **更新系统**
   ```bash
   apt update && apt upgrade -y
   ```

2. **安装Node.js**
   ```bash
   # Ubuntu/Debian系统
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs
   
   # CentOS/RHEL/OpenCloudOS系统
   curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
   yum install -y nodejs
   ```

3. **安装必要工具**
   ```bash
   # Ubuntu/Debian系统
   apt install -y git nginx
   
   # CentOS/RHEL/OpenCloudOS系统
   yum install -y git nginx
   
   # 所有系统都需要
   npm install -g pm2
   ```

4. **克隆并构建项目**
   ```bash
   git clone https://github.com/mozhi509/tools.git /var/www/web-toolkit
   cd /var/www/web-toolkit
   npm run install-all
   npm run build
   ```

5. **配置Nginx**
   ```bash
   cp /var/www/web-toolkit/nginx/nginx.conf /etc/nginx/sites-available/web-toolkit
   ln -s /etc/nginx/sites-available/web-toolkit /etc/nginx/sites-enabled/
   rm /etc/nginx/sites-enabled/default
   nginx -t && systemctl restart nginx
   ```

6. **启动应用**
   ```bash
   cd /var/www/web-toolkit
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 📋 部署要求

### 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+ / OpenCloudOS 8+
- **内存**: 最低 1GB，推荐 2GB+
- **存储**: 最低 10GB 可用空间
- **网络**: 公网IP，开放80/443端口

### 软件依赖
- Node.js 18+
- Nginx
- Git
- PM2

## 🔧 配置说明

### Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/web-toolkit/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2配置
```javascript
module.exports = {
  apps: [{
    name: 'web-toolkit',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

## 🔄 更新应用

### 使用更新脚本（推荐）
```bash
cd /var/www/web-toolkit
./update.sh
```

### 手动更新
```bash
cd /var/www/web-toolkit
git pull origin master
npm install
cd client && npm install && npm run build && cd ..
pm2 restart web-toolkit
```

## 🐳 Docker部署

### 使用Docker Compose
```bash
# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 停止服务
```bash
docker-compose down
```

## 🔒 安全配置

### 1. 配置防火墙
```bash
# Ubuntu/Debian
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# CentOS/RHEL
firewall-cmd --permanent --add-service={http,https,ssh}
firewall-cmd --reload
```

### 2. SSL证书配置
```bash
# 使用Let's Encrypt
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## 📊 监控和维护

### 查看应用状态
```bash
pm2 status
pm2 logs web-toolkit
pm2 monit
```

### 系统监控
```bash
# 查看系统资源
htop
df -h
free -h

# 查看Nginx状态
systemctl status nginx
tail -f /var/log/nginx/access.log
```

### 自动备份
```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/web-toolkit_$DATE.tar.gz /var/www/web-toolkit
find /backup -name "web-toolkit_*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# 添加到crontab（每天凌晨2点备份）
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 🐛 故障排查

### 常见问题

1. **端口被占用**
   ```bash
   netstat -tlnp | grep :80
   kill -9 PID
   ```

2. **应用无法启动**
   ```bash
   # 检查PM2日志
   pm2 logs web-toolkit --lines 50
   
   # 检查端口
   netstat -tlnp | grep :3001
   ```

3. **Nginx配置错误**
   ```bash
   nginx -t
   systemctl restart nginx
   ```

4. **权限问题**
   ```bash
   chown -R www-data:www-data /var/www/web-toolkit
   chmod -R 755 /var/www/web-toolkit
   ```

## 📞 技术支持

如遇到问题，请：
1. 查看相关日志文件
2. 检查系统资源使用情况
3. 确认防火墙配置
4. 联系技术支持：GitHub Issues

---

**注意**: 请确保在生产环境中配置适当的SSL证书和安全策略。