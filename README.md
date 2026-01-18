# DataSnail (ApexRisk AI)

DataSnail 是一款面向金融风控领域的下一代数据分析与建模平台。它结合了现代化的交互式分析界面（类似 SAS Enterprise Guide）与强大的 AI 辅助能力（Copilot），旨在为风控分析师、建模工程师提供一站式的数据探索、清洗、特征工程与建模环境。

## 🌟 核心功能 (Core Features)

### 1. 混合实验台 (Hybrid Lab)
- **多语言即时分析**: 在同一工作区内无缝切换 SQL (DuckDB) 与 Python (Pandas) 脚本。
- **变量即见即所得**: 独创的 Variable Explorer 侧边栏，实时展示 Python 运行时变量 (DataFrame)，并支持一键将其“发布”为 SQL 可查询的临时表。
- **真实执行引擎**: 后端集成 DuckDB 与 Python Kernel，支持真实数据的查询与计算，而非仅前端模拟。

### 2. 交互式数据网格 (Interactive Data Grid)
- **高性能浏览**: 支持百万级数据行的流畅虚拟滚动。
- **智能统计**: 列头自动展示直方图与统计摘要 (Min, Max, Null%)。
- **快速筛选**: 内置 Excel 风格的列筛选器。

### 3. 企业级连接力 (Connectivity)
- **多源支持**: 支持连接 MySQL, PostgreSQL, Oracle, ClickHouse 等主流数据库。
- **架构内省**: 自动扫描并展示数据库 Schema 树状结构。

### 4. 探索性分析工具箱 (EDA Toolkit)
- **右侧工具栏**: 提供开箱即用的分析工具（如分布分析、缺失值检测）。
- **即时图表**: 自动生成可视化图表，无需手写绘图代码。

---

## 🛠 技术栈 (Tech Stack)

### 前端 (Frontend)
- **框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand + React Query
- **UI 组件**: Tailwind CSS + Lucide Icons + Shadcn/ui (Concept)
- **核心控件**:
    - **编辑器**: Monaco Editor (VS Code 内核)
    - **表格**: AG Grid Community
    - **为了**: React ECharts

### 后端 (Backend)
- **框架**: FastAPI (Python 3.11+)
- **计算引擎**: DuckDB (OLAP) + Pandas
- **API 规范**: RESTful + Pydantic Sheets

---

## 🚀 快速开始 (Quick Start)

### 前置要求
- Node.js 18+
- Python 3.11+

### 1. 启动后端 (Backend)
```bash
cd backend
# 建议创建虚拟环境
# python -m venv venv && source venv/bin/activate (Linux/Mac)
# .\venv\Scripts\activate (Windows)

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
后端服务将在 `http://localhost:8000` 启动 (Docs: `http://localhost:8000/docs`)。

### 2. 启动前端 (Frontend)
```bash
cd frontend
npm install
npm run dev
```
前端界面将在 `http://localhost:5173` (或 5174/5175) 自动打开。

---

## 📂 项目结构 (Structure)

```
DataSnail/
├── backend/                # FastAPI 后端
│   ├── app/
│   │   ├── api/            # API 路由 (Routers)
│   │   ├── services/       # 业务逻辑 (Execution, Python Kernel)
│   │   ├── schemas/        # Pydantic 模型
│   │   └── main.py         # 入口文件
│   └── data/               # 本地测试数据 (loans.csv)
├── frontend/               # React 前端
│   ├── src/
│   │   ├── features/       # 业务模块 (SQL Lab, Data Grid)
│   │   ├── components/     # 通用组件
│   │   ├── store/          # Zustand 状态库
│   │   └── App.tsx         # 主应用组件
├── docs/                   # 项目文档 (Design Spec, Roadmap)
└── README.md               # 本文件
```

## 📜 许可证
Private Proprietary.
