# 风格化图标生成器

基于 Nano Banana API 的 AI 驱动风格化图标生成工具。

## 功能特性

- 🎨 **8 种预设风格**：黏土风、毛玻璃、赛博朋克、极简扁平、拟物化、卡通、渐变、线框
- 📱 **30+ 常用图标**：快速选择主页、购物车、设置、搜索等图标
- ✨ **智能提示词生成**：自动将中文图标名称转换为专业的英文 AI 绘图提示词
- 🚀 **实时生成**：直接集成 Nano Banana API

## 快速开始

### 1. 安装依赖

```bash
cd web-app
npm install
```

### 2. 配置 API Key

启动服务器后在 UI 界面中配置 API Key：

```bash
npm run dev
```

或者手动在 `.env` 文件中设置：

```
NANO_BANANA_API_KEY=你的 API Key
PORT=9527
```

获取 API Key：https://kie.ai/api-key

### 3. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server  # 后端 http://localhost:9527
npm run dev:client  # 前端 http://localhost:5173
```

### 4. 访问应用

打开浏览器：http://localhost:5173

## 使用方法

1. **配置 API Key** - 在设置卡片中输入 Nano Banana API Key
2. **选择图标** - 从预设图标中选择或输入自定义图标名称
3. **选择风格** - 选择预设风格或输入自定义风格描述
4. **生成** - 点击"生成图标"创建图标，或点击"仅生成提示词"获取 AI 提示词

## API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/create-prompt` | POST | 生成 AI 提示词 |
| `/api/generate-icons` | POST | 生成图标（提示词 + API 调用） |
| `/api/task/:taskId` | GET | 查询任务状态 |
| `/api/health` | GET | 健康检查 |

## 技术栈

- **前端**：React 18 + Vite
- **后端**：Node.js + Express
- **AI API**：Nano Banana 2

## 目录结构

```
web-app/
├── src/
│   ├── App.jsx              # 主 UI 组件
│   ├── main.jsx             # 入口文件
│   ├── server.js            # Express 服务器
│   ├── prompt-generator.js  # 提示词生成逻辑
│   └── index.css            # 全局样式
├── index.html
├── vite.config.js
├── package.json
├── .env                     # 环境配置
└── README.md
```

## 设计风格

极简主义网格设计风格：
- 微妙的网格背景图案
- 简洁的卡片式布局
- 等宽字体标签
- 精致的阴影和边框
- 简洁的配色方案

## 许可证

MIT
