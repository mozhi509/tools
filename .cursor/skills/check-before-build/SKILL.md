---
name: check-before-build
description: Runs code standards check against docs/client and docs/server before build. Use when building the project, before running npm run build or server/client build, or when the user asks to check code standards. Fails build if check does not pass.
---

# Build 前规范检查

在**任何编译（build）之前**必须先通过代码规范检查；检查不通过则**不允许编译**。

## 何时执行

- 用户或 Agent 准备执行 `npm run build`、`npm run server:build` 或希望编译前校验时。
- 本仓库的完整构建已内置：`npm run build` = 先执行 `npm run check`，通过后再编译；未通过则直接失败，不执行 tsc 或 client build。

## 检查命令

```bash
npm run check
```

- **退出码 0**：通过，可继续编译。
- **退出码 1**：未通过，必须修复后重试，**不得**执行 build。

## 检查内容（由 scripts/check-standards.js 执行）

1. **Server（server/**/*.ts）**
   - 禁止 `catch (error: any)`，必须使用 `catch (error: unknown)`，并按规范做类型收窄后再使用 `message`/`stack`。

2. **Client（client/src/**/*.ts, *.tsx，`config/api.ts` 除外）**
   - 禁止 `catch (error: any)`，应使用 `catch (error: unknown)` 并收窄类型。
   - 禁止硬编码 API 地址（如 `'/api/...'`、`localhost:3001`、含 `/api` 的完整 URL）。所有请求必须使用 `config/api.ts` 中的 `API_ENDPOINTS`；后端返回的下载路径可用 `resolveApiAssetUrl` 拼成绝对地址。

## 工作流

1. 用户或 Agent 准备 build 时，**先执行**：`npm run check`。
2. 若输出“代码规范检查未通过”并列出违规项：
   - 根据报错文件与行号修改代码，使之符合 `docs/client/代码规范.md` 与 `docs/server/代码规范.md`。
   - 再次运行 `npm run check`，直到通过。
3. **仅在** `npm run check` 通过后，才可执行：
   - `npm run build`（已含 check，无需手动先跑）
   - 或单独 `npm run server:build` / `npm run client:build`（若仅做局部编译，建议先手动执行一次 `npm run check` 以保持规范）。

## 规范依据

- 前端：`docs/client/代码规范.md`
- 后端：`docs/server/代码规范.md`

详细规则与示例见上述文档；检查脚本仅覆盖可自动检测的条款，其余仍依赖 Code Review 与人工遵守。
