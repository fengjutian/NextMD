# NextMD — Markdown 编辑器需求文档

## 1. 项目概述

NextMD 是一款跨平台 Markdown 编辑器，**优先支持 Tauri 桌面端**，同时兼容浏览器端。共用同一套 React 代码库，通过环境抽象层适配不同平台的文件操作与原生能力。

> **开发策略**：Phase 1-5 优先在 Tauri 桌面环境开发与验证，浏览器兼容作为 Phase 6 统一处理。

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 桌面框架 | Tauri 2.x | Rust 后端，轻量原生窗口 |
| 前端框架 | React 18+ | UI 层 |
| 类型系统 | TypeScript 5+ | 全项目严格模式 |
| 构建工具 | Vite 5+ | 前端打包 |
| Markdown 编辑 | TipTap (ProseMirror) | WYSIWYG 富文本编辑 + 源码模式切换 |
| Markdown 渲染 | react-markdown + remark-gfm | 源码模式预览（支持 GFM） |
| 语法高亮 (预览) | prism-react-renderer | 代码块着色 |
| 样式 | Tailwind CSS + shadcn/ui + Radix | 原子化 CSS + 预置组件 + 无样式原语 |
| 图标 | Lucide React | shadcn/ui 内置图标方案 |
| 状态管理 | Zustand | 轻量、TS 友好，全局状态 (文件/主题/AI) |
| AI 抽象层 | 自研 IAIClient 接口 | 可插拔：OpenAI / Anthropic / 国产模型 |
| AI 流式输出 | fetch ReadableStream + SSE | 打字机效果输出 |

---

## 3. 核心功能

### 3.1 编辑器
- [ ] **WYSIWYG 模式**（默认）：所见即所得，编辑时即时渲染 Markdown 样式
- [ ] **源码模式**：显示原始 Markdown 文本，适合精确控制
- [ ] **分屏模式**：左侧源码 / 右侧实时渲染预览
- [ ] **Markdown 快捷输入**：输入 `#` 自动转标题、`- ` 自动转列表、``` 自动转代码块等
- [ ] **快捷工具栏**：常用 Markdown 语法快速插入（粗体、斜体、标题、链接、图片、列表、引用、代码块、表格）
- [ ] **Markdown 粘贴**：粘贴 Markdown 文本自动转换为富文本

### 3.2 文件操作
- [ ] **打开文件**：
  - Tauri：原生文件对话框（`tauri-plugin-dialog`）
  - Browser：`<input type="file">` 或拖放
- [ ] **保存文件**：
  - Tauri：原生保存对话框 + 文件系统写入
  - Browser：`<a download>` 触发下载
- [ ] **自动保存**（可选）：定时或失焦时保存
- [ ] **未保存提示**：关闭前若有未保存更改，弹出确认

### 3.3 预览
- [ ] **实时渲染**：编辑内容即时显示预览
- [ ] **GFM 支持**：表格、删除线、任务列表、自动链接
- [ ] **代码语法高亮**：支持常见语言
- [ ] **图片渲染**：支持相对路径与绝对 URL
- [ ] **暗色/亮色主题**：编辑器与预览同步切换

### 3.4 主题
- [ ] 亮色主题
- [ ] 暗色主题
- [ ] 跟随系统主题

### 3.5 AI 功能

#### 3.5.1 AI 辅助写作（内联）
- [ ] **AI 续写**：光标处触发，AI 接续上下文生成内容
- [ ] **AI 改写**：选中文字 → 右键 / 快捷键 → 润色 / 精简 / 扩写
- [ ] **AI 翻译**：选中文字 → 翻译为指定语言 → 替换或插入
- [ ] **AI 总结**：选中文字 → 生成摘要
- [ ] **内联指令**：编辑器内输入 `/ai 指令` 触发（类似 Notion AI）

#### 3.5.2 AI 对话面板（侧边栏）
- [ ] **对话式交互**：侧边栏聊天界面，多轮对话
- [ ] **上下文感知**：自动携带当前编辑器内容作为上下文
- [ ] **一键插入**：AI 回复内容可一键插入到编辑器光标位置
- [ ] **对话历史**：保存最近对话，可切换/清除
- [ ] **停止生成**：流式输出中途可停止

#### 3.5.3 AI 后端抽象层
```
src/lib/ai/
├── types.ts           # AI 相关类型定义
├── IAIClient.ts       # AI 客户端抽象接口
├── providers/
│   ├── openai.ts      # OpenAI / 兼容 API
│   ├── anthropic.ts   # Anthropic Claude
│   └── mock.ts        # Mock 实现（开发/测试用）
├── aiStore.ts         # AI 状态管理（对话、配置）
└── prompts.ts         # 预设提示词模板
```

**IAIClient 接口设计**：
```ts
interface IAIClient {
  chat(messages: AIMessage[], options?: ChatOptions): AsyncIterable<AIChunk>;
  abort(): void;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

type AIChunk =
  | { type: 'content'; text: string }
  | { type: 'done'; fullText: string }
  | { type: 'error'; message: string };
```

- **可插拔设计**：运行时通过环境变量或设置切换 provider。
- **流式优先**：所有 provider 返回 `AsyncIterable`，前端逐字渲染。
- **Mock provider**：开发阶段不消耗 API 额度。

#### 3.5.4 AI 配置（设置面板）
- [ ] API 密钥配置（支持本地存储，不离开客户端）
- [ ] Provider 切换（OpenAI / Anthropic / 自定义端点）
- [ ] 模型选择（GPT-4o / Claude 3.5 等）
- [ ] 温度、最大 Token 等参数调节

---

## 4. 双环境架构

```
项目根目录/
├── src/                        # React 前端（共用）
│   ├── lib/
│   │   ├── env.ts              # 环境检测 isTauri()
│   │   ├── fileOps.ts          # IFileOps 接口定义
│   │   └── ai/
│   │       ├── types.ts        # AI 类型定义
│   │       ├── IAIClient.ts    # AI 客户端抽象接口
│   │       ├── providers/
│   │       │   ├── openai.ts   # OpenAI 兼容 provider
│   │       │   ├── anthropic.ts # Anthropic provider
│   │       │   └── mock.ts     # Mock provider
│   │       ├── aiStore.ts      # AI 状态管理
│   │       └── prompts.ts      # 预设提示词
│   ├── components/
│   │   ├── editor/
│   │   │   ├── MdEditor.tsx    # TipTap 编辑器 (WYSIWYG + 源码模式)
│   │   │   ├── MdPreview.tsx   # react-markdown 预览（源码模式分屏用）
│   │   │   └── Toolbar.tsx     # 格式工具栏
│   │   ├── ai/
│   │   │   ├── AIPanel.tsx     # AI 对话面板
│   │   │   ├── AIChat.tsx      # 聊天消息列表
│   │   │   ├── AIInput.tsx     # 聊天输入框
│   │   │   └── AISettings.tsx  # AI 设置面板
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx   # 主版面布局
│   │   │   ├── Sidebar.tsx     # 侧边栏（文件树）
│   │   │   └── StatusBar.tsx   # 状态栏
│   │   └── file/
│   │       ├── FileOps.tauri.ts # Tauri 平台实现（调用 Rust）
│   │       └── FileOps.web.ts  # 浏览器平台实现（纯前端）
│   ├── hooks/
│   │   ├── useMarkdown.ts      # Markdown 状态管理
│   │   ├── useFile.ts          # 文件读写 hook
│   │   ├── useTheme.ts         # 主题切换 hook
│   │   └── useAI.ts            # AI 对话与写作 hook
│   ├── stores/
│   │   ├── editorStore.ts      # 编辑器状态 (内容/光标/视图模式)
│   │   ├── fileStore.ts        # 文件状态 (当前文件/已打开列表)
│   │   ├── themeStore.ts       # 主题状态 (亮色/暗色/跟随系统)
│   │   └── aiStore.ts          # AI 状态 (配置/对话历史/连接状态)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── src-tauri/                  # Rust 后端（仅 Tauri）
│   ├── src/
│   │   ├── main.rs             # Tauri 入口
│   │   ├── commands.rs         # Tauri Commands（read/write/dialog）
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

### 4.1 环境检测 (`env.ts`)

```ts
// 运行时判断是否在 Tauri 环境
export const isTauri = (): boolean => {
  return '__TAURI_INTERNALS__' in window;
};
```

- **构建期**：Vite 共用同一份代码；Tauri 模式下前端静态资源内嵌于桌面应用。
- **运行时**：通过 `isTauri()` 动态选择文件操作实现、对话框、快捷键行为等。

### 4.2 文件操作抽象

```ts
interface FileOps {
  openFile(): Promise<{ name: string; content: string } | null>;
  saveFile(name: string, content: string): Promise<boolean>;
}
```

- **Tauri 实现**：使用 `@tauri-apps/plugin-dialog` 打开原生对话框，使用 `@tauri-apps/plugin-fs` 读写文件。
- **Browser 实现**：使用 `<input type="file">` 读取，使用 Blob + `<a download>` 保存。

### 4.3 双环境架构详解 — 前端与后端如何协作

核心原则：**React 前端代码 100% 共用，平台差异通过接口 + 运行时注入隔离。**

```
                    ┌─────────────────────────┐
                    │     React 前端 (共用)     │
                    │   components / hooks     │
                    │       App.tsx            │
                    └──────────┬──────────────┘
                               │ 调用统一接口
                    ┌──────────▼──────────────┐
                    │    平台抽象层 (lib/)      │
                    │   env.ts  → isTauri()    │
                    │   IFileOps 接口          │
                    └─────┬──────────┬────────┘
                          │          │
               isTauri() = true    isTauri() = false
                          │          │
              ┌───────────▼──┐  ┌───▼────────────┐
              │ Tauri 实现    │  │  Browser 实现   │
              │ (调用 Rust)   │  │  (纯前端 API)    │
              └───────┬──────┘  └────────────────┘
                      │
          ┌───────────▼──────────┐
          │   Rust 后端 (Tauri)   │
          │  ┌─────────────────┐ │
          │  │ Tauri Commands   │ │
          │  │ ├ read_file      │ │
          │  │ ├ write_file     │ │
          │  │ ├ open_dialog    │ │
          │  │ └ save_dialog    │ │
          │  └─────────────────┘ │
          │  ┌─────────────────┐ │
          │  │ 原生能力          │ │
          │  │ ├ 文件系统 (fs)   │ │
          │  │ ├ 原生对话框      │ │
          │  │ ├ 系统菜单        │ │
          │  │ └ 窗口管理        │ │
          │  └─────────────────┘ │
          └──────────────────────┘
```

#### 浏览器环境（纯前端）

```
浏览器
├── React SPA（所有逻辑在前端）
├── 文件读取：<input type="file"> + FileReader API
├── 文件保存：Blob → URL.createObjectURL → <a download>
├── 最近文件：localStorage
└── 无后端进程
```

- **无 Rust 后端**：所有操作在浏览器沙箱内完成。
- **文件持久化**：只能「下载到本地」或「重新打开」，无法原地修改磁盘文件（浏览器安全限制）。

#### Tauri 桌面环境（前端 + Rust 后端）

```
Tauri 窗口
├── WebView（React SPA 共用代码）
│   └── 通过 @tauri-apps/api 调用 Rust 命令
└── Rust 后端进程
    ├── Tauri Commands（暴露给前端的 API）
    ├── 文件系统直接读写（原地修改）
    ├── 原生文件对话框
    ├── 系统菜单（文件/编辑/视图）
    └── 窗口管理（标题栏显示文件名等）
```

- **Rust 后端**：编译为独立二进制，随应用启动。
- **文件原地修改**：直接读写磁盘文件，无需下载/上传。
- **原生体验**：系统菜单、原生对话框、窗口标题栏集成。

#### 关键设计决策

| 决策点 | 方案 |
|--------|------|
| 前端代码 | 完全共用，不写 `if isTauri()` 在组件中散落 |
| 平台差异 | 通过接口（`IFileOps`）封装，`isTauri()` 只在入口处判断一次 |
| Rust 后端 | 仅做文件 I/O 和系统调用，不做业务逻辑 |
| 状态管理 | 所有编辑状态在 React 端，Rust 只负责读写字节 |

### 4.4 状态管理 (Zustand)

采用 **Zustand** 管理全局状态，按领域拆分为 4 个 store：

```ts
// editorStore.ts — 编辑器核心状态
interface EditorStore {
  content: string;              // 当前 Markdown 内容
  viewMode: 'split' | 'edit' | 'preview';  // 视图模式
  cursorPosition: number;       // 光标位置
  selection: { from: number; to: number } | null;
  setContent: (content: string) => void;
  setViewMode: (mode: ViewMode) => void;
}

// fileStore.ts — 文件状态
interface FileStore {
  currentFile: { name: string; path?: string } | null;
  isModified: boolean;          // 是否有未保存更改
  recentFiles: string[];        // 最近打开 (浏览器端存 localStorage)
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
}

// themeStore.ts — 主题状态
interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';  // 实际应用的主题
  setTheme: (t: Theme) => void;
}

// aiStore.ts — AI 配置
interface AIStore {
  provider: 'openai' | 'anthropic' | 'mock';
  apiKey: string;               // 仅存内存，不持久化
  model: string;
  conversations: AIConversation[];
  isGenerating: boolean;
}
```

**设计原则**：
- **细粒度订阅**：Zustand 的选择器机制确保组件只 re-render 其订阅的字段
- **不变式**：所有状态修改通过 store 的 action 方法，不直接 mutate
- **持久化**：`fileStore.recentFiles` 和 `themeStore` 通过 Zustand 的 `persist` 中间件自动同步 localStorage
- **AI 密钥**：仅存在内存中（`aiStore`），不落盘、不进入 localStorage

---

## 5. UI 设计

### 5.0 首页 + 主界面布局（IDE 风格）

采用 IDE 风格的三栏布局，侧边栏常驻，无文件时中央显示欢迎引导：

#### 启动时（无文件打开）

```
┌──────┬───────────────────────────────────────────┐
│ 📁   │                                           │
│ 文件  │         NextMD — Markdown Editor         │
│      │                                           │
│ ▸ 资  │    ┌──────────┐  ┌──────────────┐       │
│   源  │    │ 📄 新建   │  │ 📂 打开文件   │       │
│ ▸ 项  │    └──────────┘  └──────────────┘       │
│   目  │                                           │
│      │    最近文件                                │
│ 📄 R  │    README.md                    昨天     │
│ 📄 n  │    notes.md                      2天前   │
│ 📄 p  │    project-doc.md                1周前   │
│      │                                           │
│      │    快捷模板                                │
│      │    [空白文档] [会议纪要] [技术文档]         │
│      │                                           │
├──────┴───────────────────────────────────────────┤
│ 📄 无打开文件                      Markdown ✓    │
└──────────────────────────────────────────────────┘
```

#### 打开文件后

```
┌──────┬──────────────────────────┬───────────────┐
│ 📁   │ 工具栏: B I H1 🔗 🖼 ...│  🤖 AI 面板   │
│ 文件  ├──────────────────────────┤               │
│      │                          │  User: ...    │
│ ▸ 资  │  WYSIWYG 编辑区          │               │
│   源  │  (TipTap)               │  AI: 你好，   │
│ ▸ 项  │                          │  有什么可以   │
│   目  │  # 标题                  │  帮助你的？   │
│      │  **粗体** _斜体_          │               │
│ 📄 R  │                          │  ──────────   │
│ 📄 n  │                          │  输入消息...   │
│ 📄 p  │                          │  [发送]        │
│      │                          │               │
├──────┴──────────────────────────┴───────────────┤
│ WYSIWYG | 📄 README.md ●  | 字数:123 | AI ●    │
└──────────────────────────────────────────────────┘
```

#### 布局要点

- **左侧边栏**（~240px）：文件树 + 最近文件，可折叠，始终可见
  - Tauri：可浏览真实文件系统目录
  - 浏览器：显示最近打开列表（localStorage）
- **中央编辑区**：TipTap 编辑器，无文件时显示欢迎引导
- **右侧 AI 面板**（~320px）：可折叠，默认收起
- **底部状态栏**：视图模式、文件名、修改状态、字数、AI 连接状态

#### 分屏（源码模式）

```
┌──────┬─────────────────┬───────────┬───────────┐
│ 📁   │ 工具栏           │           │ 🤖 AI     │
│ 文件  ├────────┬────────┤  预览     │  面板     │
│      │ 源码   │ 预览    │ (源码模式 │           │
│      │ 编辑   │ 渲染    │  分屏时   │           │
│      │        │         │  显示)    │           │
│      │        │         │           │           │
├──────┴────────┴─────────┴───────────┴───────────┤
│ 源码 | 📄 README.md ●  | 字数:123               │
└──────────────────────────────────────────────────┘
```

---

## 6. 开发阶段

### Phase 1：基础搭建（Tauri 优先）
- 初始化 Vite + React + TypeScript 项目
- 加入 Tauri 框架（先不做浏览器适配）
- 配置 Tailwind CSS + shadcn/ui + Radix
- 建立 Zustand store 骨架
- 实现首页 UI（新建/打开/最近文件/模板）

### Phase 2：编辑器核心
- 集成 TipTap + 核心扩展（Markdown 输入规则、快捷操作）
- 集成 react-markdown 预览（源码模式分屏用）
- 实现 WYSIWYG / 源码模式切换
- 实现工具栏与格式快速插入
- 首页「新建」→ 进入编辑模式

### Phase 3：文件操作（Tauri）
- Rust 端实现文件读写命令
- 原生文件对话框（打开/保存）
- 首页「打开文件」→ 对话框 → 编辑器
- 最近文件持久化（localStorage / Tauri app data）
- 未保存提示

### Phase 4：主题与样式
- 亮色/暗色主题切换
- Markdown 预览样式（类似 GitHub 风格）
- 首页与编辑器整体 UI 打磨

### Phase 5：AI 功能
- 实现 IAIClient 抽象接口
- 实现 OpenAI 兼容 provider + Mock provider
- 实现 AI 对话面板 UI
- 实现 AI 辅助写作（续写、改写、翻译）
- 实现 AI 设置面板
- 流式输出 + 停止生成

### Phase 6：浏览器兼容
- 实现浏览器端文件操作（File API）
- 浏览器端首页适配（无原生对话框时降级为 web 方案）
- 浏览器端构建与测试
- 双环境一致性验证

---

## 7. 验收标准

1. **Tauri 桌面端**（优先级最高）：
   - `cargo tauri dev` 启动桌面应用
   - 首页可新建、打开文件、查看最近文件
   - WYSIWYG 编辑 + 源码模式切换
   - 原生文件对话框打开/保存
   
2. **浏览器环境**（Phase 6）：
   - `npm run dev` 可在浏览器完整编辑与预览 Markdown
   - 文件操作降级为 File API + Blob 下载

3. **构建**：`npm run build` + `cargo tauri build` 均无错误

4. **AI 功能**：
   - Mock provider 下对话面板多轮交互正常
   - 切换至真实 API 后可流式输出
   - AI 内容可一键插入编辑器
   - 设置面板可切换 provider 和模型

5. **AI 抽象层**：新增 provider 只需实现 `IAIClient` 接口，无需改动组件代码
