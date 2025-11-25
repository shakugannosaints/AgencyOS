 # Agency OS · GM 信息追踪工具

> 面向三角机构桌游主持人（GM）的离线优先控制台。复刻 Agency OS 的冷峻企业风，实现战役、特工、任务、异常体与混沌池的全流程追踪。

![f5e06bba3cdaddc99c085924dbd1bb52.png](https://s2.loli.net/2025/11/25/cZPuOqojgaSVLvG.png)

## ✨ 核心能力

1. **战役仪表板**：展示分部状态、下一次任务、混沌池与异常体统计（`/` 仪表盘）。
2. **人力资源档案**：特工列表、在职状态、嘉奖/申诫统计等（`/agents`）。
3. **任务控制台**：单页实时面板，集中日志、混沌池、散逸端、可选目标提示等（`/missions`）。
4. **异常体 / 散逸端库**：按焦点、领域、状态浏览，追踪相关任务与混沌效应（`/anomalies`）。
5. **结算报告**：任务简报与结算信息归档，支持按战役维度回顾（`/reports`）。

## 🧱 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite 7
- **路由**：`react-router-dom`（多模块页面）
- **状态管理**：Zustand（实体 store）
- **异步数据**：TanStack Query
- **表单/校验**：React Hook Form + Zod
- **样式**：Tailwind CSS + Radix UI 主题组件
- **数据层**：Dexie.js（IndexedDB 持久化）+ JSON 导入/导出战役快照
- **图标**：Lucide React

> ⚠️ Vite 7 推荐使用 Node.js ≥ 20.19（或 22.12+）。如果你的 Node 版本较低，`npm run dev` 时可能出现警告或失败，建议升级。

## 📁 项目结构

```text
src/
  main.tsx           # React 入口
  App.tsx            # 根组件，挂载路由/布局
  app/
    providers.tsx    # Router、主题等全局 providers
    layouts/
      app-shell.tsx  # 左侧导航 + 顶部状态条 + 导入导出快照
  modules/
    dashboard/
      pages/
        dashboard-page.tsx  # 战役仪表板
    agents/
      pages/
        agents-page.tsx     # 特工档案
    missions/
      pages/
        missions-page.tsx   # 任务控制
    anomalies/
      pages/
        anomalies-page.tsx  # 异常体库
    reports/
      pages/
        reports-page.tsx    # 任务报告
  components/ui/     # 设计系统组件（面板、统计卡、命令条等）
  services/db/       # Dexie client、快照导入导出
  stores/            # 状态 store（战役、主题等）
  lib/               # 工具函数、mock 数据与类型
```

更多整体架构、数据模型与模块说明见 `docs/product-architecture.md`。

## 🚀 快速开始

1. 安装依赖：

   ```powershell
   npm install
   ```

2. 启动开发服务器：

   ```powershell
   npm run dev
   ```

   默认会在浏览器中打开本地地址（通常是 http://localhost:5173）
   如果没打开可以在控制台自己看一眼。

3. 构建生产包：

   ```powershell
   npm run build
   ```

4. 预览构建结果：

   ```powershell
   npm run preview
   ```

## 💾 数据存储与快照

- 所有战役数据（特工、任务、异常体等）存储在浏览器的 IndexedDB 中，通过 Dexie.js 进行读写。
- 在左侧导航下方的「数据快照」区域可以：
  - **导出内容**：将当前战役状态导出为 JSON 文件，便于备份或在其他浏览器导入。
  - **导入内容**：从 JSON 快照中恢复战役进度。
- 快照结构由 `services/db/repository.ts` 中的方法维护，前后版本不兼容时请参考代码中的迁移逻辑。
- ！！注意！！更换浏览器、清理浏览器数据都可能导致数据丢失！在进行这些行为之前一定要导出数据！！

## 📜 参考资料

- `docs/product-architecture.md`：整体需求、数据模型、模块划分、技术路线。

## 说明的说明

- 本项目说明由AI创建，如有错误请反馈。