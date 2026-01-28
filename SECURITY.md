# 安全配置指南

## 环境变量配置

### 必需的安全配置

1. **Redis密码**
   ```bash
   REDIS_PASSWORD=your_strong_redis_password
   ```

2. **JWT密钥**（至少32字符）
   ```bash
   JWT_SECRET=your_jwt_secret_key_minimum_32_characters
   ```

3. **会话密钥**（至少32字符）
   ```bash
   SESSION_SECRET=your_session_secret_key_minimum_32_characters
   ```

## 安全措施

### 已实施的安全措施

1. **Helmet中间件**
   - 启用内容安全策略(CSP)
   - 防止点击劫持
   - 隐藏X-Powered-By头

2. **速率限制**
   - API端点限制：15分钟内100个请求/IP
   - 防止暴力攻击和DDoS

3. **CORS配置**
   - 生产环境仅允许信任的域名
   - 开发环境允许localhost

4. **文件上传安全**
   - 文件大小限制：100MB
   - 文件类型验证
   - 路径遍历防护
   - 文件名清理

5. **XSS防护**
   - Markdown解析器HTML清理
   - 链接协议验证
   - 危险HTML标签移除

6. **输入验证**
   - 文件路径验证
   - 参数完整性检查
   - 错误信息保护

### 部署前检查清单

- [ ] 设置强密码和密钥
- [ ] 配置HTTPS证书
- [ ] 设置防火墙规则
- [ ] 启用日志监控
- [ ] 配置备份策略
- [ ] 定期安全更新

## 生产环境配置

1. **使用反向代理**（Nginx/Apache）
2. **启用HTTPS**
3. **配置防火墙**
4. **定期更新依赖包**
5. **监控和日志分析**

## 紧急响应

如发现安全问题，请立即：
1. 检查访问日志
2. 更新所有密钥和密码
3. 审查用户数据
4. 部署安全补丁