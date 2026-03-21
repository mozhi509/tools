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
# 同时启动前后端开发服务器（不自动起 Redis，需本机已有 Redis 或 Docker）
npm run dev

# 一键：若 6379 空闲则启动 Redis + 前后端（优先本机 redis-server，否则用 Docker 起一个 Redis）
npm run dev:local
```

依赖说明：**Redis**（聊天等功能需要）。本地可先 `brew install redis && brew services start redis`，再 `npm run dev`；或直接 `npm run dev:local`。若 `.env` 里给 Redis 设置了 `requirepass`，请保证本地 Redis 配置与 `REDIS_PASSWORD` 一致，或开发环境暂时留空密码并使用无密码的本地实例。

```bash
# 或者分别启动（开发）
npm run server:dev  # 后端 ts-node（端口 3001）
npm run client      # 前端 webpack（端口 3000）
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

**卡在 `Creating an optimized production build...`？** 多半是 **内存不够**（Webpack 吃内存，小机器/容器会被 OOM 杀进程，看起来像「死掉」）或 **其实还在跑只是很慢**。也可用 `top`/`htop` 看 `node` 是否占满 CPU、是否被系统杀进程（`dmesg | grep -i oom`）。

**降低前端编译内存占用（CRA / `react-scripts build`）常用手段：**

| 手段 | 说明 |
|------|------|
| `GENERATE_SOURCEMAP=false` | 不生成 source map，**省内存、省时间**（本项目 `client` 的 `build` 已开启） |
| `DISABLE_ESLINT_PLUGIN=true` | 构建时**不跑 ESLint**，减轻内存与耗时（本项目 `build` 已开启；发布前可本地再单独 `npm run lint` 若你配置了 lint） |
| 控制 Node 堆上限 | `NODE_OPTIONS=--max-old-space-size=...`：过小易 OOM，过大不一定更省内存，按机器调整 |
| 在更大内存机器上构建 | CI / 本机 build 再上传 `client/build`，小内存服务器只跑 `node` 不提供 Webpack |
| 换 Vite 等构建工具 | 需改工程，内存通常更友好，工作量大 |

若仍 OOM，可在构建前再加大堆：`export NODE_OPTIONS=--max-old-space-size=8192`，或换更大内存环境。

### Docker Compose / PM2

敏感配置（如 **`REDIS_PASSWORD`**）仅从环境变量读取，**仓库内不设默认密钥**。部署前请在项目根目录创建 `.env`（可参考 `.env.example`）并填写 `REDIS_PASSWORD`。

```bash
# Docker
docker compose up -d --build

# 或使用脚本（读取 .env.prod 或 .env，PM2 使用 --env production）
./manage.sh start-prod
```

### 单元测试

```bash
# 一次性跑完全部测试（后端 Jest + 前端 CRA）
npm run test

# 仅后端（server/tests，supertest + 路由）
npm run test:server

# 仅前端（client/src 下 *.test.ts / *.test.tsx）
npm run test:client
```

- **后端**：`server/tests/` 覆盖 `tools` / `health` / `share` / `chat` 等路由（Redis 相关用 Jest mock）。
- **前端**：`client/src/setupTests.ts` 引入 `@testing-library/jest-dom`；`react-router-dom` 在 Jest 中通过 `client/__mocks__/react-router-dom.tsx` 与 `package.json` 的 `jest.moduleNameMapper` 指向该 mock，以兼容 React Router v7。

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