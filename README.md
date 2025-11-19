# Web工具集

一个功能强大的在线Web工具集，提供JSON格式化、Base64编解码、URL编解码等实用开发工具。

## 技术栈

- **前端**: React 18, React Router, Lucide React
- **后端**: Node.js, Express
- **样式**: 自定义CSS (响应式设计)
- **其他**: Axios, React Syntax Highlighter, React Toastify

## 功能特性

### 🛠️ 主要工具

1. **JSON格式化工具**
   - JSON格式化和美化
   - JSON格式验证
   - JSON压缩
   - 自定义缩进
   - 语法高亮显示
   - 复制和下载功能

2. **Base64编解码工具**
   - 文本转Base64编码
   - Base64解码为文本
   - 支持中英文混合内容
   - 模式快速切换
   - 输入输出内容交换

3. **URL编解码工具**
   - URL编码处理
   - URL解码还原
   - 特殊字符处理
   - 支持中文参数
   - 一键打开URL链接

### 🎨 设计特性

- **响应式设计**: 支持桌面和移动设备
- **现代UI**: 美观的渐变色彩和动画效果
- **交互友好**: Toast提示、加载状态、错误处理
- **侧边栏导航**: 清晰的工具分类和导航结构
- **实时反馈**: 操作结果的即时显示

## 项目结构

```
web-toolkit/
├── server/                 # Node.js后端
│   ├── index.js           # 主服务器文件
│   └── routes/
│       └── tools.js       # API路由
├── client/                # React前端
│   ├── public/
│   │   └── index.html     # HTML模板
│   └── src/
│       ├── components/
│       │   ├── Header.js
│       │   ├── Sidebar.js
│       │   ├── Dashboard.js
│       │   └── tools/
│       │       ├── JsonFormatter.js
│       │       ├── Base64Tool.js
│       │       └── UrlEncoderTool.js
│       ├── App.js         # 主应用组件
│       ├── App.css        # 全局样式
│       └── index.js       # 入口文件
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 安装和运行

### 环境要求

- Node.js 14+
- npm 或 yarn

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装客户端依赖
cd client && npm install
```

### 开发模式运行

```bash
# 同时启动前后端开发服务器
npm run dev

# 或者分别启动
npm run server  # 启动后端服务器 (端口 3001)
npm run client  # 启动前端开发服务器 (端口 3000)
```

### 生产环境部署

```bash
# 构建客户端
npm run build

# 设置环境变量
export NODE_ENV=production

# 启动生产服务器
npm start
```

## API接口

### JSON工具
- `POST /api/tools/json/format` - JSON格式化
- `POST /api/tools/json/validate` - JSON验证
- `POST /api/tools/json/minify` - JSON压缩

### Base64工具
- `POST /api/tools/base64/encode` - Base64编码
- `POST /api/tools/base64/decode` - Base64解码

### URL工具
- `POST /api/tools/url/encode` - URL编码
- `POST /api/tools/url/decode` - URL解码

### 健康检查
- `GET /api/health` - 服务状态检查

## 开发计划

### 即将添加的工具

- [ ] 哈希生成器 (MD5, SHA1, SHA256)
- [ ] 密码生成器
- [ ] 颜色选择器
- [ ] 时间戳转换器
- [ ] 正则表达式测试器
- [ ] Markdown预览器
- [ ] SQL格式化工具
- [ ] 代码美化工具

### 功能增强

- [ ] 工具收藏夹
- [ ] 历史记录
- [ ] 键盘快捷键
- [ ] 深色模式
- [ ] 多语言支持

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发规范

1. 代码风格遵循ESLint规则
2. 组件使用函数式组件和Hooks
3. 样式使用CSS模块化
4. API接口遵循RESTful规范

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue: [GitHub Issues](https://github.com/your-username/web-toolkit/issues)
- 邮箱: your-email@example.com

---

**注意**: 这是一个开源项目，仅供学习和参考使用。在生产环境中使用前请确保充分测试。