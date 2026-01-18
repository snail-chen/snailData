# Project Process Log

## 2026-01-16: Project Pivot & Planning
- **Decision**: Pivoted from Flow-Chart based UI to Tab-Based UI (SAS EG Parity -> Browser/Excel Style).
- **Architecture**: Confirmed "Frontend-First" Strategy.
- **Spec Update**: Updated `DesignSpec.md` to v2.8 (Tab Workbench).
- **Roadmap**: Created `DevelopmentRoadmap.md` with Feature-Driven priorities (P0/P1/P2).
- **Action**: Cleaned up previous frontend files to restart with React+Vite bootstrap.

## 2026-01-17: Phase 3 Extension - Hybrid Lab (F08.6) Completed
- **Feature**: Implemented Python Execution Engine for Hybrid Lab.
- **Backend**: Added `PythonSessionService` with persistent variables and `py.` publishing logic map.
- **UI**: Upgraded `SQLLab` to `HybridLab` (Multi-tab support). Added `VariableExplorer` sidebar.
- **2026-01-19**: 完成 Hybrid Lab Python Engine (F08.6)。实现 Python 会话管理与前端变量浏览器。
- **2026-01-19**: 补全基础分析功能 (F07.1, F07.2)。
    - 后端: `AnalysisService` 新增 `dupes` (重复校验) 与 `correlation` (相关性矩阵) 算法。
    - 前端: `ToolkitPanel` 新增入口；`StatsTab` 支持 Heatmap 可视化渲染。

## 2026-01-17: Design Iteration - Hybrid Lab
- **Spec Update**: Refined Section 3.5 (Hybrid Lab) based on user feedback.
- **Change**: Switched from "Implicit All-Sync" to **"Explicit Publish + Lazy `py.` Access"** to prevent namespace pollution.
- **Status**: Design approved; ready for next implementation phase.

## 2026-01-16: Phase 2 - Data Access Layer (F03-F05) Completed
- **Connectivity**: Implemented backend `ConnectionService` & API; Added "Add Connection" Modal.
- **Catalog**: Implemented Mock Schema Scanner API; Added Lazy-loading `SchemaTree` component.
- **Data Grid**: Implemented `ExecutionService` Preview API; Integrated `AgGrid` with backend data.
- **Outcome**: User can connect to DB, browse tables, and preview data.

## 2026-01-16: Phase 2 - UX Polish (Connection Manager)
- **Fix**: Resolved "Add Connection" button responsiveness in Sidebar.
- **Enhancement**: Added templates for 8+ DB types (DuckDB/SQLite file path support).
- **Enhancement**: Made Database Name optional for server-based connections (Instance Scanning).

## 2026-01-16: Phase 3 - Exploratory Analysis (F06-F07)
- **Toolkit**: Implemented Right Sidebar with "Data Probe" tools list.
- **Analysis**: Created `StatsTab` using Recharts for Histogram/Distribution/Missing/Outlier plots.
- **Logic**: Implemented backend `AnalysisService` with DuckDB for real SQL aggregations (IQR, Histogram, Null counts).
- **Data**: Added `backend/data/loans.csv` sample dataset for live testing.
- **Grid**: Implemented SQL "WHERE" Filter Bar in Data Preview (Real-time executed via DuckDB).
- **SQL Lab**: Implemented Basic SQL Editor with "Run Script" simulation.
- **SQL Scripts**: Added Script Management (Create/List/Delete) and "Run Selection" (Partial Execution) capability.
- **Workspace**: Added "WORKSPACE" section in Sidebar to list generated Session Tables (`result_...`), enabling quick preview switching.
