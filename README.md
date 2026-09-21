# NextMD

NextMD 是基于 React、TypeScript 和 Tauri 的 Markdown 编辑器。浏览器版使用文件选择器和下载保存；桌面版使用原生对话框读写文件。

## 开发

```bash
npm install
npm run dev
npm run build
npm run lint
npm run tauri dev
```

`npm run build` 会先进行 TypeScript 检查，再构建前端。Tauri 开发和打包还需要本机的 Rust 与平台构建环境。

## 代码结构

| 目录 | 职责 |
| --- | --- |
| `src/components/layout/` | 应用布局、侧栏、状态栏、欢迎页 |
| `src/components/editor/` | TipTap 编辑器、预览、工具栏、查找替换 |
| `src/components/ai/` | AI 面板及对话界面 |
| `src/hooks/useDocumentLifecycle.ts` | 快捷键、离开提示、文件拖入监听 |
| `src/lib/documentActions.ts` | 新建、打开、关闭、保存的统一入口 |
| `src/lib/fileOps.*.ts` | 浏览器与 Tauri 文件操作实现 |
| `src/lib/editorSearch.ts` | Markdown 和富文本的匹配位置计算 |
| `src/lib/ai/` | AI 客户端、提示词、流式会话处理 |
| `src/stores/` | 编辑器、文件、AI、主题和提示状态 |
| `src-tauri/` | 桌面窗口与权限配置 |

## 扩展约定

- 文档切换和保存统一调用 `documentActions.ts`，以保留未保存确认与保存状态检查。
- 新增文件系统能力时，在 `fileOps.web.ts` 和 `fileOps.tauri.ts` 提供对应行为，并检查 `src-tauri/capabilities/default.json` 权限。
- Markdown 正文以 `editorStore.content` 为准。富文本编辑器通过 `MdEditor` 与其同步。
- AI 请求流程放在 `src/lib/ai/`，组件只处理交互与展示。

## 当前限制

- 浏览器版保存会触发下载，无法原地覆盖磁盘文件。
- HTML 导出不会把本地图片嵌入导出文件。
- 富文本和源码模式之间的 Markdown 往返可能改变部分不受 TipTap 支持的语法；编辑复杂文档前宜保留原文件副本。
