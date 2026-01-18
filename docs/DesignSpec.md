# DataSnail - AI-Powered Financial Risk Analytics Platform

**Design Specification v2.8**

## 1. Product Overview (产品概述)

**DataSnail** 是一款面向金融风控领域的数据分析与建模平台，旨在通过深度集成的大模型（LLM）能力，彻底改变传统的数据分析工作流。

* **核心定位**: 金融风控数据分析师 + 建模工程师的一站式工作台。
* **独特价值**:
  1. **大模型深度集成**: 不是简单的 Chatbot，而是能感知上下文、引用数据、读取本地知识库的智能副驾驶。
  2. **混合模型架构**: 同时支持公有云大模型（OpenAI/Claude）和企业私有本地模型（Qwen/Llama），兼顾能力与隐私。
  3. **企业知识增强**: 内置本地知识库（RAG），融合企业内部的风控政策、指标定义和历史报告。
  4. **任意数据引用**: 允许用户灵活地将工作台中的表格、SQL 结果、图表作为“上下文”发送给 AI 进行分析。

---

## 2. System Architecture (系统架构)

采用现代化的前后端分离架构，新增独立的 **AI Kernel** 层；同时预留企业级扩展能力（多租户、权限治理、可观测、计算引擎可插拔）。

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        UI[Workbench UI]
        State[Global Context Manager]
        Chat[AI Assistant Sidebar]
    end

    subgraph "Backend (FastAPI)"
        API[API Gateway]
        Auth[AuthN/AuthZ (SSO/RBAC)]
        Audit[Audit & Policy]
    
        subgraph "Core Services"
            DB_Mgr[Connection Manager]
            Query[Query Planner & Pushdown]
            LocalHub[Local Data Hub (Virtualize/Materialize)]
            Compute[Compute Engine (DuckDB/Polars/Arrow)]
            Viz_Eng[Visualization Engine]
            Meta[Metadata & Catalog]
            Job[Job Orchestrator]
            Proj[Project & Artifacts Service]
            TaskLib[Task Library & Runner]
        end
    
        subgraph "AI Kernel"
            Router[Model Router (Hybrid)]
            Context_Proc[Context Processor]
            RAG[RAG Engine (ChromaDB)]
            Guard[Prompt/Data Guardrails]
        end
    end

    subgraph "Data Layer"
        Business_DB[(MySQL/Oracle/Hive/ClickHouse)]
        Federation[(Federation Engine (Trino))]
        Knowledge_Base[(Local Knowledge Vector Store)]
        Cache[(Result Cache)]
        LocalStore[(Local Dataset Store (Parquet/MinIO))]
    end

    subgraph "Model Layer"
        Cloud_LLM[OpenAI / DeepSeek API]
        Local_LLM[Local Inference (Ollama/vLLM)]
    end

    UI --> API
    API --> Auth
    API --> Audit
    API --> DB_Mgr
    API --> Query
    API --> LocalHub
    API --> Compute
    API --> Viz_Eng
    API --> Meta
    API --> Job
    API --> Proj
    API --> TaskLib
    API --> Router
    Router --> Cloud_LLM
    Router --> Local_LLM
    Router --> RAG
    Router --> Guard
    DB_Mgr --> Query
    Query --> Business_DB
    Query --> Federation
    Federation --> Business_DB
    Query --> Compute
    LocalHub --> Business_DB
    LocalHub --> LocalStore
    RAG --> Knowledge_Base
    Compute --> Cache
    Compute --> LocalStore
```

### 2.1 Enterprise Analytics Architecture (企业级分析架构建议)

面向企业级“数据分析能力”时，需要把“交互式工作台”与“企业分析平台能力”解耦：前者保证体验与生产力，后者提供统一口径、规模化计算、可复用资产与协作工作流。

核心设计原则（以能力为中心）：

1. **语义先行**：指标、维表、口径在语义层统一定义，减少“同指标不同口径”，让分析可复用、可沉淀。
2. **可插拔计算**：同一份分析请求，按数据规模/延迟目标选择执行引擎（本机/分布式/OLAP），并保留可回放的执行计划。
3. **面向资产**：Query/Dataset/Chart/Report/Model 都是可管理资产，支持版本、权限、依赖与复用。
4. **端到端闭环**：从探索（EDA）到口径固化（Metric）到产出（Report）到自动化（Job），在同一工作区可回溯。

推荐分层（逻辑视图）：

- **Experience Layer**：工作台（Data/SQL/Chart/Model/Report），统一的上下文管理与操作历史。
- **Semantic Layer**：指标体系、维度/层级、时间口径、过滤口径、可复用数据集（Data Product）。
- **Compute & Query Layer**：交互查询（低延迟）、查询加速（缓存/物化/聚合）、批处理任务（高吞吐）、模型训练（资源隔离）。
- **Governance & Ops Layer**：数据目录、血缘、质量、权限策略、任务调度、可观测与成本归集。
- **Data Layer**：湖仓/数仓、流式与离线、特征与标签（可选 Feature Store/Label Store）。

企业级能力落点（用户可感知）：

- **统一口径**：指标中心可配置、可版本化，AI/SQL/看板都引用同一口径。
- **查询加速**：结果缓存、摘要缓存、物化/聚合可选，支持秒级自助分析。
- **规模化计算**：同一分析可在不同引擎执行，支持大数据集与并发团队使用。
- **协作复用**：资产可分享、可引用、可回放，团队知识沉淀为可复用的模板与组件。

### 2.2 20GB 级表分析能力：MVP 选型 (20GB-scale Analytics MVP)

为了快速落地并保证单机体验，MVP 阶段采用 **"Heuristic Pushdown + DuckDB Local"** 策略，暂不引入 Trino 和分布式计算。

#### 2.2.1 技术栈选择（简化版）

1.  **数据在数据库 (Pushdown)**：
    *   **策略**: 直接生成 SQL 下推到源库 (MySQL/PG/Oracle/ClickHouse)。
    *   **限制**: 跨源 Join 暂不支持下推，需抽取到本地。
2.  **数据在本地/跨源 (DuckDB)**：
    *   **策略**: 使用 **DuckDB** 作为本地高性能分析引擎。
    *   **能力**: 支持 Parquet/CSV 读写，支持 Out-of-core (磁盘溢写) 处理 20GB+ 数据，支持 SQL 分析。
3.  **Python 计算 (Pandas/Polars)**：
    *   **策略**: 用于不支持 SQL 的复杂逻辑 (如某些清洗规则、特定算法)。
    *   **限制**: 严格限制内存使用，大表操作优先使用 DuckDB。

#### 2.2.2 执行路由 (Heuristic Router)

MVP 不实现基于代价的优化器，仅实现简单启发式规则：

1.  **单源查询** -> **下推 (Pushdown)**
2.  **跨源 Join / 本地文件** -> **DuckDB (Local Hub)**
    *   自动将源数据流式抽取为 Parquet (Cache)，然后在 DuckDB 中 Join。
3.  **复杂算法 / AI 分析** -> **Job (Async)**
    *   进入 Celery/Redis 队列，后台运行。

---

### 2.3 端到端技术栈 (MVP All-in-One)

目标：单机 Docker Compose 一键启动，无需 K8s/S3。

#### 2.3.1 前端
*   **Core**: React 18 + TypeScript + Vite
*   **State**: Zustand (Store), TanStack Query (API)
*   **Flow**: React Flow (流程画布)
*   **Grid**: AG Grid Community (虚拟滚动)
*   **Viz**: ECharts
*   **Editor**: Monaco Editor

#### 2.3.2 后端
*   **Server**: FastAPI (Python 3.11)
*   **DB**: SQLAlchemy (Meta & Connection), DuckDB (Local Compute)
*   **Queue**: Celery + Redis (可选，MVP 可用 `BackgroundTasks` 简化，但推荐保留 Redis 以支持长任务状态查询)
*   **Storage**: Local Filesystem (artifacts/logs/datasets) - *MVP 替代 MinIO*

---

### 2.4 后端架构设计 (MVP Layout)

```
backend/
  app/
    main.py
    api/ ...
    core/ ...
    db/ ...
    # 核心业务逻辑
    services/
      project_service.py   # 项目/资产管理
      flow_service.py      # 流程图/节点管理
      execution_service.py # 路由与执行 (Pushdown/DuckDB)
      ai_service.py        # LLM 交互
    # 执行引擎
    engines/
      duckdb_engine.py
      sql_generator.py     # 基于 SQLGlot
```

---

## 5. Implementation Roadmap (实施路线图 - Revised)

### Phase 1: Foundation & Flow UX (Sprint 1-2)
*   **目标**: 搭建项目骨架，实现核心的 "Project - Flow - Node" 交互。
*   **任务**:
    1.  初始化 FastAPI + React 项目结构。
    2.  实现 **Project Tree** (侧栏) 和 **Flow Canvas** (中间)。
    3.  实现 **Data Source Node** (拖拽连接进画布)。
    4.  实现简单的 **SQL Node** (输入 SQL，输出 Result)。
    5.  实现 **Result Viewer** (以 AG Grid 展示节点产出)。

### Phase 2: Analytics & Connectivity (Sprint 3-4)
*   **目标**: 接入真实数据库，实现下推与本地计算。
*   **任务**:
    1.  完善 **Connection Manager** (连接 MySQL/Oracle 等)。
    2.  实现 **Schema Scanner** (生成 Catalog)。
    3.  实现 **Heuristic Router** (下推 vs DuckDB)。
    4.  实现 **Result Artifacts** (将结果落盘为 Parquet/JSON)。

### Phase 3: AI Co-Pilot (Sprint 5)
*   **目标**: AI 赋能分析。
*   **任务**:
    1.  实现 **AI Chat Sidebar**。
    2.  实现 **Context Manager** (引用节点数据)。
    3.  实现 **Text-to-SQL** (生成 SQL Node)。

### Phase 4: Financial Specs (Sprint 6)
*   **目标**: 风控专用功能。
*   **任务**:
    1.  实现 **WOE/IV Node** (可视化分箱调整)。
    2.  实现 **Scorecard Node**。
    3.  集成本地知识库 (RAG)。


#### 2.4.2 关键数据模型（最小可用集合）

- **users**：id, email, password_hash/oidc_sub, status, created_at
- **workspaces**：id, name, owner_user_id
- **connections**：id, workspace_id, type, name, config_json, secret_ref, created_at
- **catalog_objects**：id, connection_id, kind(db/schema/table/column), path, profile_json, updated_at
- **projects**：id, workspace_id, name, description, created_at
- **flows**：id, project_id, version, nodes_json, edges_json, created_at
- **datasets**：id, project_id, kind(virtual/materialized), name, spec_json, created_at
- **dataset_versions**：id, dataset_id, version, manifest_json, storage_prefix, created_at
- **artifacts**：id, project_id, kind(dataset/chart/report/log), name, meta_json, storage_uri, created_at
- **runs**：id, project_id, flow_id, node_id, inputs_signature, params_json, status, started_at, ended_at
- **jobs**：id, run_id, status, progress, queue, started_at, ended_at, error_json
- **audit_logs**：id, user_id, action, target_type, target_id, detail_json, created_at

#### 2.4.3 推荐后端目录结构（Python）

```
backend/
  app/
    main.py
    api/
      deps.py
      routers/
        auth.py
        connections.py
        catalog.py
        projects.py
        flows.py
        datasets.py
        query.py
        tasks.py
        jobs.py
        artifacts.py
    core/
      config.py
      security.py
      logging.py
      errors.py
    db/
      session.py
      models/
      migrations/
    services/
      auth_service.py
      connection_service.py
      catalog_service.py
      project_service.py
      dataset_service.py
      artifact_service.py
      query_service.py
      job_service.py
      task_service.py
    execution/
      planner/
      engines/
        pushdown_engine.py
        federation_engine.py
        duckdb_engine.py
        polars_engine.py
      cache/
    ai/
      router.py
      rag.py
      guardrails.py
```

#### 2.4.4 执行链路（同步/异步统一）

1. 前端发起 QuerySpec / TaskRun 请求
2. Query Planner 生成 ExecutionPlan（含路由、SQL、阈值、缓存键）
3. 若满足交互阈值：同步执行并返回小结果集 + 摘要
4. 若超阈值：创建 Run + Job，进入队列；前端轮询/订阅 Job 状态
5. 结果以 Artifact 形式落地（表/图/报告/日志），Run 记录可回放

#### 2.4.5 控制面 / 执行面拆分（Control Plane / Execution Plane）

为支撑“多人并发 + 单用户多大任务”的稳定性，同时为后续局部 Java 替换留出空间，后端在逻辑上拆为控制面与执行面：

- **控制面（Control Plane）**：面向用户请求与资产治理，追求一致性、可追溯与权限完备。
  - API Gateway / AuthN/AuthZ / Audit & Policy
  - Project/Flow/Artifact/Dataset/Metadata 等领域服务
  - Query Planner（生成 ExecutionPlan、阈值决策、缓存键、降级策略）
- **执行面（Execution Plane）**：面向数据扫描与计算执行，追求吞吐、隔离与可扩展。
  - Pushdown 执行器（源库 / ClickHouse / Trino）
  - Local Compute（DuckDB Out-of-core / Polars）
  - Job Worker（任务队列消费、进度上报、日志与产物落地）

拆分后关键收益：

- **资源隔离**：控制面可按并发与 I/O 调整；执行面按 CPU/内存/磁盘独立扩容。
- **弹性与容错**：执行面可水平扩展 worker；单任务失败不影响控制面可用性。
- **演进友好**：执行面可以更早进行 Java 化/分布式化，而不影响控制面业务资产模型。

默认演进路线（从简单到可扩展）：

1. **模块化单体（默认起步）**：FastAPI 内部按 services/execution 分层；Celery/Redis 作为执行面队列与 worker。
2. **可部署的“二进制拆分”**：控制面 API 与执行面 Worker 作为两个独立部署单元（同一代码库也可）。
3. **微服务化（按需）**：当团队/规模驱动时，再把 Query Planner、Dataset/Artifact、AI Kernel 等拆为独立服务。

#### 2.4.6 可替换为 Java 的服务边界（Java Replacement Boundaries）

在保证迭代速度的前提下，优先把“收益最大、边界清晰”的模块设计为可替换单元：

- **AuthN/AuthZ & Audit（高优先）**：企业对接 SSO/OIDC、复杂 RBAC/ABAC、审计合规常需要更强工程化与集成能力。
- **Execution Plane Worker（高优先）**：需要更强并发与资源治理（线程池、限流、隔离、队列治理）时可用 Java 实现 worker，同时复用同一套执行契约与 Artifact 交付模型。
- **Query Planner（中优先）**：当规则/代价模型变复杂或需要与企业查询引擎深度集成，可逐步迁移为 Java 服务（或仅迁移部分优化器能力）。
- **Connection Manager（中优先）**：连接池与驱动适配复杂时可替换；控制面仍保持统一连接资产模型与密钥管理策略。

不建议早期替换的模块：

- **Project/Flow/Artifact 资产模型**：产品迭代期变化频繁，优先保持在同一控制面实现以降低协作成本。

#### 2.4.7 服务间契约与兼容治理（Contract-first）

为了支持“Python 先行 + 局部 Java 替换”，所有跨边界调用遵循契约优先原则：

- **契约形态**：对外 REST 以 OpenAPI 为准；对内跨语言可选 REST（MVP）或 gRPC（后续）。
- **版本策略**：契约 `contract_version` 显式携带；向后兼容优先（仅加字段不删字段）。
- **错误模型**：统一错误码与可机器解析的 `details`，确保前端/编排层可自动降级与重试。
- **可观测**：强制透传 `request_id/trace_id`；执行面上报分阶段进度与日志索引。
- **幂等性**：对创建类与触发类接口支持 `idempotency_key`，避免重试导致重复 Job/Artifact。

跨边界示例（控制面 -> 执行面）：

```json
{
  "contract_version": "v1",
  "idempotency_key": "idem_01J...",
  "request_id": "req_01J...",
  "action": "execute_plan",
  "plan": {
    "route": "pushdown|federation|duckdb|job",
    "sql": "SELECT ...",
    "limits": { "timeout_ms": 8000, "max_rows": 10000 },
    "cache": { "key": "cache_01J...", "mode": "read_write" }
  },
  "artifact_target": { "project_id": "proj_01J...", "run_id": "run_01J..." }
}
```

### 2.5 前端架构设计（可直接开发）

前端以“工作台（Workbench）”为核心，统一管理：项目树、流程画布、右侧任务工具栏、结果查看器、AI 侧栏与上下文引用。

#### 2.5.1 页面与核心模块

- **App Shell**：顶部导航（Workspace/Project 切换、用户设置）、布局（左树/中画布/右工具/底部 AI）
- **Resources Panel**：连接管理、Schema 浏览、知识库文档管理
- **Project Tree**：项目资产（Query/Dataset/Chart/Report/Model/Doc）树
- **Process Flow Canvas**：节点编辑、连线、单节点/子图运行、运行状态展示
- **Task Panel**：预制任务列表 + 参数面板（Schema 驱动）+ 一键运行
- **Results Viewer**：Artifact 查看（表/图/摘要/日志），支持固定到项目资产
- **AI Assistant**：对话 + Context Chips + 快捷动作（解释/生成 SQL/生成报告）

#### 2.5.2 推荐前端目录结构（React）

```
frontend/
  src/
    app/
      routes.tsx
      providers.tsx
    api/
      client.ts
      query.ts
      tasks.ts
      projects.ts
    stores/
      workspaceStore.ts
      contextStore.ts
      flowStore.ts
    features/
      connections/
      catalog/
      project/
      flow/
      results/
      ai/
    components/
      DataGrid/
      SqlEditor/
      Charts/
      Panels/
    styles/
```

#### 2.5.3 前后端交互约定（保证可开发、可联调）

- **统一响应包**：`{ request_id, data, error }`；error 包含 `code/message/details`
- **分页**：支持 keyset 分页（cursor）与浅分页（offset 仅限小范围）
- **Job**：长任务统一走 `job_id`，前端以轮询（TanStack Query refetchInterval）驱动 UI 状态
- **Artifact**：所有结果必须可持久化与可再次打开（Results Viewer 只渲染 Artifact）

### 2.6 部署形态与环境配置（建议默认）

- **开发（本地）**：前端 Vite Dev Server + 后端 FastAPI（热重载）；Metadata 可用 SQLite；Redis 可选
- **生产（单机/小团队）**：Nginx + 前端静态资源 + FastAPI（多进程）+ PostgreSQL + Redis + MinIO
- **生产（企业扩展）**：Kubernetes 部署；外置 Postgres/Redis/S3；接入 OIDC/SSO 与集中审计

---

## 3. Core Features (核心功能)

### 3.1 混合大模型引擎 (Hybrid AI Engine) **[Core Differentiator]**

* **双模切换**: 用户可在“设置”中配置：
  * **Cloud Mode**: 使用 OpenAI/Claude/DeepSeek API，适合处理脱敏数据、通用代码生成、复杂逻辑推理。
  * **Local Mode**: 使用本地部署模型（如 Qwen2.5-14B-Int4），适合处理敏感数据（PII）、企业内部机密分析。
* **本地知识库 (Local Knowledge Base)**:
  * **上传管理**: 支持上传 PDF/Markdown/Txt 格式的风控文档（如《信贷审批政策2025版》、《特征工程规范》）。
  * **RAG 检索**: AI在其回答中会自动检索并引用知识库内容，解决大模型幻觉问题。
* **灵活上下文引用 (Flexible Context)**:
  * **"Ask Data"**: 在数据表格、SQL编辑器、图表中，用户可以通过“右键 -> 引用到对话”或“拖拽”的方式，将当前数据片段（Schema、Data Sample、Query）作为 Context 发送给 AI。

### 3.2 全能数据库连接 (Universal Connectivity)

* **多源支持**: MySQL, PostgreSQL, Oracle, SQL Server, Hive, ClickHouse。
* **智能扫描**: 支持不指定 Database 名称，自动扫描连接下的所有 Schema/Database。
* **Schema 浏览器**: 树形展示库表结构，悬浮显示字段统计信息（空值率、唯一值）。

### 3.3 交互式分析工作台 (Interactive Workbench)

* **Data Grid (数据网格)**:
  * 基于 AG Grid，支持百万级数据行虚拟滚动。
  * 列头统计直方图，快速感知数据分布。
  * **AI 筛查**: 集成异常值检测、重复值标记功能。
* **SQL Lab**:
  * (See Section 3.5 for Detailed Design)
  * Monaco Editor 内核，支持 SQL 智能补全。
  * **Text-to-SQL**: 用自然语言描述需求，AI 自动生成复杂 SQL。
* **Visual Board (可视化)**:
  * 拖拽式图表配置。
  * **金融专用图表**: WOE Binning Plot (分箱图), KS/ROC Curves, PSI Stability Chart。

### 3.4 企业级数据分析能力 (Enterprise Analytics Capabilities)

#### 3.4.1 语义层与指标中心 (Semantic Layer & Metrics)

把“企业口径”做成可复用能力：不仅能算，还能让不同团队用同一套定义。

- **指标（Metric）**：口径定义、过滤口径、时间口径、版本与变更说明。
- **维度（Dimension）**：维表关系、层级（如地区/机构层级）、默认粒度。
- **语义查询**：Text-to-Metric / Metric-to-SQL，支持“按指标提问”而不是只写 SQL。
- **数据产品（Data Product）**：把常用查询沉淀为可复用 Dataset，并可被看板/报告/模型复用。

#### 3.4.2 多引擎查询与加速 (Federation, Acceleration)

企业级分析的瓶颈通常是“慢”和“不可扩展”，需要把执行引擎与加速策略做成平台能力。

- **联邦查询**：跨 MySQL/Oracle/Hive/ClickHouse 的统一查询入口与结果格式。
- **执行引擎路由**：按数据规模、预估代价、并发压力选择引擎（本机/外部查询引擎/OLAP）。
- **结果加速**：结果缓存、摘要缓存、可选物化（按指标/看板热度触发）。
- **交互式采样**：在不拉全量明细的前提下，支持分层抽样、TopN、分布摘要用于探索分析。

#### 3.4.3 自助分析资产化与协作 (Assets & Collaboration)

把“人肉分析”变成“团队资产”，让分析结论能被复用、复盘、迁移。

- **资产模型**：Query/Dataset/Chart/Dashboard/Report/Model 统一为可管理对象。
- **版本与对比**：关键资产可版本化，可对比差异（SQL/口径/参数/输出摘要）。
- **引用与依赖**：看板引用 Dataset，报告引用图表与指标，形成可视化依赖图。
- **协作流程**：分享、评审、发布；模板化（报告模板、指标模板、分析模板）。

#### 3.4.4 工作流自动化与可回放 (Workflow & Reproducibility)

企业级的核心体验是“从探索到产出再到自动化”，并且随时可复现。

- **任务编排**：分箱/特征计算/看板刷新/报表生成可作为异步任务运行。
- **参数化运行**：按日期/机构/产品等参数运行同一分析与报告。
- **回放与快照**：记录输入数据签名、指标版本、参数、执行计划、输出摘要，形成可回放会话。
- **输出物交付**：报告发布、定时投递（邮件/IM/系统回调由后端集成实现形态决定）。

#### 3.4.5 AI 分析增强（面向生产力）

AI 的价值不是“聊天”，而是把复杂分析动作变成可执行、可资产化的操作。

- **意图到资产**：对话生成 SQL/指标/看板草稿，自动落到对应资产并可编辑。
- **证据引用**：AI 结论必须引用数据摘要/图表/指标版本，支持一键跳转到证据。
- **分析建议**：缺失/异常/漂移/分箱单调性等自动诊断，并给出可一键执行的修复方案。

#### 3.4.6 维度建模与数据对齐（自助建模）

企业级分析必须支持“多数据源、多粒度、多口径”的对齐，否则只能停留在单表探索。

- **关系建模**：配置事实表与维表关系、主外键与基数提示，支持多事实表分析。
- **派生维度**：时间窗、分层、分群（Cohort）等常用分析维度自助生成并复用。
- **对齐向导**：多数据集 Join/Union/对齐规则可视化配置，生成可复用 Dataset。

#### 3.4.7 多形态分析（SQL + Notebook + 可视化）

- **SQL 分析**：从探索到产出的一等公民，支持参数化与复用。
- **Notebook（企业版）**：服务端运行 Python 分析用于复杂建模与高级统计，并把输出固化为资产。
- **可视化分析**：支持钻取、联动、筛选保存为看板视图，用于面向业务的自助分析。

#### 3.4.8 OLAP 体验（切片/钻取/口径一致）

- **维度层级**：地区/机构/产品等层级钻取，支持默认汇总与下钻路径。
- **时间智能**：同比/环比、滚动窗口、分期累计等常用时间分析能力。
- **一致口径复用**：看板计算优先引用指标中心定义，避免口径漂移。

### 3.5 基于会话的混合计算实验室 (Session-based Hybrid Lab) **[New Design]**

为了打造面向分析人员极其易用，且能完美替代 SAS EG “脚本编写 + 临时库管理”体验的模块，设计了本模块。其核心哲学是**基础设施隐形化**——分析师只管写逻辑，系统自动接管“中间表”的生命周期。

#### 3.5.1 核心概念模型：按需绑定的隐形“草稿箱” (On-Demand Invisible Work Library)

为了解决“Python 临时变量泛滥污染 SQL 命名空间”的问题，我们引入**显式发布 + 惰性引用**机制：

1.  **SQL -> Python (Explicit)**: 在 SQL 中执行 `CREATE TABLE temp_A AS ...` 是强烈的持久化信号。系统会自动将其转换为 Python 可调用的 Dataframe `temp_A`。
2.  **Python -> SQL (Lazy & Explicit)**:
    *   **Private by Default**: Python 中生成的变量（如 `df_temp`）默认仅存在于 Python 内存，**不自动**污染 SQL 命名空间。
    *   **Lazy Access**: SQL 可通过特殊前缀直接查询 Python 变量，例如 `SELECT * FROM py.df_temp`（运行时动态绑定）。
    *   **Explicit Publish**: 用户可调用 `session.publish(df, 'table_name')` 将其注册为正式的 SQL 表（出现在侧边栏）。

#### 3.5.2 UI 布局设计 (Interface Design)

**1. 中间主区：脚本编辑器 (Script Editor)**

*   **多语言 Tab**：Python (Pandas) / SQL (DuckDB)。
*   **执行与引用**:
    *   SQL 编辑器支持智能提示 `py.` 命名空间下的可用 DataFrame。

**2. 右侧边栏：临时变量管理器 (Variable Explorer)**

*   **分区展示**:
    *   **Published Tables**: 已注册为 SQL 表的数据（可供 SQL 直接引用）。
    *   **Runtime Variables**: 当前 Python 会话中的所有 DataFrame（仅供 Python 或 `py.` 引用）。
*   **交互**:
    *   **Drag to Publish**: 将 "Runtime Variables" 拖入 "Published Tables" 区域，立即注册。

#### 3.5.3 交互流程设计 (User Journey)

**场景**：“取出贷款数据，清洗后，用 SQL 聚合”。

1.  **加载与清洗 (Python)**:
    ```python
    raw = load_table('loan_data')
    # 中间过程，不会污染 SQL 列表
    _temp = raw.dropna() 
    # 最终结果
    clean_data = _temp[_temp['score'] > 600]
    ```
    *状态*: 右侧边栏 "Runtime Variables" 显示 `raw`, `clean_data`。SQL 无法直接 `SELECT * FROM clean_data`。

2.  **SQL 聚合 (SQL - 惰性引用)**:
    分析师只想临时查一下，不需要注册表：
    ```sql
    SELECT region, COUNT(*) FROM py.clean_data GROUP BY region
    ```
    *执行*: DuckDB 零拷贝读取 `clean_data` 内存对象。

3.  **正式发布 (Promote to Table)**:
    分析师决定把清洗好的数据作为公共基表：
    *   **方式 A (Code)**: Python 中写 `session.publish(clean_data, 'base_table')`。
    *   **方式 B (UI)**: 在右侧将 `clean_data` 拖入 Published 区。
    *   *结果*: `base_table` 出现在 SQL 自动补全中，可直接 query。

#### 3.5.4 技术实现方案 (DuckDB + Arrow replacement scan)

后端利用 DuckDB 的 Replacement Scans 特性实现 `py.` 语法拦截。

1.  **Interceptor**: 配置 DuckDB `replacement_scan` 钩子。
2.  **Resolution**: 当 SQL 解析到 `py.var_name`，钩子触发，检查 Python 上下文。
3.  **Zero-Copy**: 获取 `var_name` 的 Arrow 指针，注册为临时 View 返回给 DuckDB 执行引擎。

#### 3.5.5 易用性增强细节 (The "Delighters")

1.  **Log 面板 (SAS Log 复刻)**：
    *   在编辑器下方保留一个 `Log` 标签页。
    *   显示详细的执行日志（如 "Table WORK.TEMP created..."）。
    *   **报错高亮**：如果代码出错，直接高亮并给出 AI 修复建议。
2.  **代码片段库 (Snippets)**：
    *   在右侧提供“常用代码块”：双击插入“WOE 计算代码”、“分组求和代码”。
3.  **变量快照 (Snapshot)**：
    *   支持历史记录一键回滚。

### 3.6 企业级保障能力（作为分析能力的底座）

#### 3.5.1 多租户与权限 (Multi-Tenant, AuthN/AuthZ)

- **租户模型**：Tenant -> Workspace -> Project -> Dataset/Report/Notebook（逻辑资源）。
- **权限模型**：RBAC（角色）+ ABAC（策略）组合。
- **字段级/行级能力**：在查询与结果层提供隔离与脱敏能力，确保分析可规模化推广。

#### 3.5.2 数据目录与质量 (Catalog & Quality)

- **Catalog**：连接、库表、字段、标签、负责人、使用热度与健康度。
- **质量画像**：缺失率、唯一值、分布漂移、口径校验，支持看板级数据健康提示。

---

## 4. UI/UX Design (界面设计)

**布局风格**: "Modern & Dense" - 类似 VS Code 的高密度生产力工具风格。

* **左侧栏 (Resources)**: 数据库连接、知识库文件管理。
* **中间区 (Canvas)**: 对标 SAS Enterprise Guide（SAS EG）的“项目 + 流程 + 结果”工作流：以流程编排驱动分析执行与产物沉淀，而不仅仅是多 Tab 视图。
* **中间区底栏 (AI Co-Pilot)**: **常驻或浮动**的 AI 对话窗口。
  * **Context Area**: 显示当前已引用的上下文（如 "Table: user_loan (5 rows)", "Doc: Risk_Policy.pdf"）。
  * **Chat Area**: 对话流。
  * **Action Area**: 预设快捷指令 ("解释数据", "生成 SQL", "清洗建议")。
* **右侧边栏 (Right Sidebar)**：上下文感知的多功能面板。
  * **在 Data Grid 视图**: 显示 **“常用分析工具箱” (Analysis Toolkit)**，预设多种一键分析工具（主成分分析、WOE、IV值计算等）与可视化工具。
  * **在 SQL Lab 视图**: 显示 **“临时变量管理器” (Variable Explorer)**，实时展示当前 Session 中的中间表与元数据。

### 4.1 关键交互模型 (Interaction Model)

#### 4.1.1 核心对象与状态

- **Workspace**：当前工作区（连接、项目、历史、权限边界）。
- **Artifact**：可被引用/复用的产物（Query、Dataset、Chart、Report、Model、Doc）。
- **Context**：发给 AI 的上下文对象集合（显式引用 + 隐式环境，如当前 Tab、当前选择列）。
- **Session**：一次分析会话的时间线（用户操作、查询、AI 对话、生成的产物）。

#### 4.1.2 上下文引用与可解释性

上下文引用是交互闭环的核心：用户要清楚“AI 看到了什么”，并能一键撤回。

- **添加**：右键“引用到对话” / 拖拽到 Context Area / 快捷键添加（可选）。
- **预览**：Context chip 悬浮显示：类型、行数/列数、采样方式、脱敏状态、来源时间。
- **撤回**：一键移除；移除后后续对话不再可见该对象。
- **锁定**：可锁定某个上下文，避免在 Tab 切换时被自动替换。

#### 4.1.3 工具面板（右侧）触发方式

- **拖拽触发**：将 Dataset/列 直接拖到工具卡片上，弹出参数面板并执行。
- **选中触发**：在 Data Grid 选择列/范围后点击工具卡片，默认参数自动填充。
- **组合触发**：支持多数据源（多表/多查询结果）选择后进入“合并/对齐”向导。
- **拖拽代码化 (Hybrid Lab 特有)**：将变量从右侧拖入代码编辑器，自动生成 SQL/Python 引用代码。

### 4.2 端到端用户流程 (E2E Flows)

#### 4.2.1 首次连接并预览数据

1. 左侧点击“添加连接” -> 选择类型 -> 填写连接信息 -> 测试连接。
2. 连接成功后触发 Schema 扫描 -> Catalog 展示库表树。
3. 选择表 -> 打开 Data Grid Tab -> 默认加载前 N 行 + 列统计摘要。
4. 右键列头：缺失/异常/分布 -> 一键分析 -> 结果以侧栏卡片或图表产物呈现。

#### 4.2.2 Text-to-SQL（可回放）

1. 用户在 AI 输入框描述需求 -> AI 生成 SQL（附口径/过滤条件说明）。
2. SQL 进入 SQL Lab（可编辑），并带上“来源：AI”标记。
3. 用户点击执行 -> 结果形成 Dataset Artifact -> 可继续可视化/特征工程。
4. 会话记录保存：自然语言 -> SQL -> 执行结果签名 -> 下游产物链路。

#### 4.2.3 WOE/IV 分箱工作流（含建议与回滚）

1. Data Grid 选择特征列 + 标签列（或从 Project 设置中指定标签）。
2. 右侧选择 “WOE 分箱” -> 参数面板（分箱数、单调性约束、缺失单独成箱等）。
3. 运行后产生：分箱表、WOE 映射、IV 值、单调性诊断图。
4. 若不满足约束：AI 给出调整建议（合并箱/重分箱）-> 用户一键应用 -> 生成新版本产物。
5. 历史版本可回滚：每次调整生成一个可对比的版本节点。

#### 4.2.4 报告生成与审批（企业版）

1. 用户选择要纳入报告的 Artifact（图表、指标、结论、SQL、模型评估）。
2. 点击“生成风控分析报告” -> AI 生成结构化草稿（目录、结论、证据引用）。
3. 用户编辑/补充 -> 发起审批（可选）-> 发布为 Report Artifact。
4. 导出需符合策略：导出字段检查、脱敏、审批记录与审计日志落库。

#### 4.2.5 指标定义 -> 看板自助分析（企业版）

1. 数据负责人在指标中心创建指标：选择事实表、维度、过滤口径、时间口径并保存版本。
2. 分析师在看板中选择指标 + 维度层级，配置筛选与钻取路径。
3. 看板发布后，所有用户在同一口径下切片/下钻；口径变更通过指标版本升级同步到看板。

### 4.3 右侧工具栏：预制分析一键出结果 (Preset Analytics Toolkit)

右侧工具栏的目标是把“常用分析方法”产品化：用户只需选择数据源与工具，就能得到可复用的分析结果（并沉淀为资产），而不是每次从零写 SQL/代码。

#### 4.3.1 工具库分层（覆盖常用分析方式）

- **数据概览**：描述统计、分布概览、TopN/分位数、分组汇总。
- **数据质量**：缺失分析、重复值、唯一值、异常值检测、规则校验。
- **关联与多变量**：相关性矩阵、分组对比、交叉表、PCA 降维（可选）。
- **时序与稳定性**：趋势分解、同比环比、漂移/稳定性（PSI）、样本对比。
- **风控建模**：WOE/IV 分箱、单调性诊断、KS/ROC、阈值分析、模型解释（可选）。
- **输出与交付**：一键生成分析报告（从已选择的图表/指标/结论自动汇总）。

#### 4.3.2 一键运行交互（Select -> Run -> Output）

1. **选择数据源**：Dataset/Query Result/多数据集组合（进入对齐向导）。
2. **选择预制工具**：工具卡片点击即运行；若缺少必需输入（如标签列），自动弹出最小参数面板并给出默认值。
3. **运行与状态**：展示运行中状态、预计耗时；失败时给出可重试与诊断入口。
4. **输出结果**：自动在 Canvas 生成结果页（卡片 + 表格 + 图），并在 Session 中记录一次运行。
5. **资产沉淀**：输出自动生成 Artifact（Chart/Report/Dataset），可被看板/报告复用。

#### 4.3.3 工具契约（让“预制分析”可规模扩展）

每个预制工具通过统一契约接入，便于持续扩展“所有常用分析方式”：

- **输入**：支持 Dataset/多 Dataset；支持列选择（数值/类别/时间/标签）与过滤条件。
- **参数**：以 Schema 化参数面板表达（默认值 + 校验 + 预设模板）。
- **输出**：产物类型（Summary/Chart/Table/Derived Dataset）、可视化建议、可复用的运行记录（可回放）。
- **依赖**：对语义层指标、维度层级、时间口径的可选绑定（企业版优先推荐绑定）。

### 4.4 主工作区设计：多标签页分析模式 (Tab-based Workbench)

**设计变更**：响应用户直觉，主工作区放弃强制的“流程图”模式，回归高效的 **多标签页 (Multi-Tab)** 交互（类似浏览器/Excel）。

#### 4.4.1 核心交互逻辑

1.  **资源即标签**：从左侧项目树双击 数据表、SQL、图表，均在中间区域以 **新标签页** 打开。
2.  **分析即裂变**：在“数据预览”标签页中执行分析（如 WOE 分箱），结果会在 **新标签页**（或右侧分屏）打开，而不是由用户画线连接。
3.  **上下文保持**：标签页保留各自的筛选、排序和滚动状态。

#### 4.4.2 标签页类型

-   **Data Grid Tab**: 核心分析器。支持查看明细、列统计、筛选、右侧工具栏联动。
-   **SQL Lab Tab**: 代码编辑器。支持多 Result Set 结果展示。
-   **Chart/Dashboard Tab**: 可视化画布。
-   **Report Tab**: 报告编辑器。

#### 4.4.3 隐式流程与血缘 (Implicit Lineage)

虽然界面上是 Tab，但后端依然记录 **"谁产生了谁"**：
*   用户在 Tab A (Table) 执行了 Group By -> 产生了 Tab B (Result)。
*   后端记录 `Lineage: Table A -> Task: GroupBy -> Artifact B`。
*   **项目视图**：提供一个辅助的“血缘查看器”来展示这些关系，而不是让用户在大画布上拖拽。

---

## 5. Implementation Roadmap (实施路线图 - Revised)

### 5.0 核心调整
**移除** "React Flow 流程画布" 作为 P0 需求。
**新增** "Tab Manager (多标签管理)" 作为 P0 核心。

### Phase 1: MVP Core (Sprint 1-2)

1.  **Infrastructure**: FastAPI + React + Zustand 脚手架。
2.  **Layout System**: 实现 `demo.html` 的四分屏布局（左树、右工具、下 AI、中 Tab）。
3.  **Tab Manager**: 实现标签页的增删改查、状态保持、类型分发（Grid/SQL/Viz）。
4.  **DB Connect & Preview**: 连接数据库 -> 左侧树列出 -> 双击打开 Data Grid Tab -> 分页预览。

### Phase 2: Analysis Tools (Sprint 3-4)

1.  **Side Toolkit**: 实现右侧工具栏 UI 与后端 API 的联动。
2.  **Immediate Analysis**: 选中数据 -> 点击工具 -> 弹出结果 Tab。
3.  **Result Persistence**: 分析结果自动保存为 Artifact，并不丢失。

### Phase 3: AI Co-Pilot (Sprint 5)

(保持不变：右下角 AI 对话，引用当前激活 Tab 的数据作为 Context)

### Phase 4: Financial Specs (Sprint 6)

(保持不变：WOE/IV 等专业界面作为一种特殊的 Tab 类型)


---

## 6. API Interface Draft (API 草案)

### 6.0 通用约定（必须遵守，便于直接开发）

#### 6.0.1 认证

- **Auth Header**：`Authorization: Bearer <access_token>`
- **企业版 SSO**：OIDC 登录完成后换取平台 Token（细节由企业集成决定）

#### 6.0.2 统一响应结构

```json
{
  "request_id": "01J...ULID",
  "data": {},
  "error": null
}
```

`error` 结构：

```json
{
  "code": "AUTH_REQUIRED",
  "message": "missing token",
  "details": {}
}
```

建议错误码（最小集合）：

- `AUTH_REQUIRED` / `AUTH_FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONNECTION_FAILED`
- `QUERY_TIMEOUT` / `QUERY_TOO_LARGE`
- `JOB_FAILED`

#### 6.0.3 分页

- **浅分页（仅小范围）**：`{ limit, offset }`
- **游标分页（默认）**：`{ limit, cursor }`；cursor 由后端返回并在后续请求回传

### 6.1 Auth（建议最小集合）

* `POST /api/auth/login`: 密码登录（企业版可不提供）。
* `POST /api/auth/refresh`: 刷新 Token。
* `POST /api/auth/logout`: 退出登录。
* `GET /api/me`: 当前用户信息与权限摘要。

### AI 相关接口

* `POST /api/ai/chat`: 发送对话，包含 `messages` 和 `context_ids`。
* `POST /api/ai/knowledge/upload`: 上传知识库文档。
* `GET /api/ai/models`: 获取可用模型列表 (Local/Cloud)。

### 数据相关接口

* `POST /api/connect`: 连接数据库。
* `GET /api/schema/{conn_id}`: 获取元数据。
* `POST /api/preview/{conn_id}/{table}`: 分页获取数据。
* `POST /api/analysis/stats`: 计算选中列的统计信息。
* `POST /api/query/plan`: 生成执行计划（路由 + SQL/采样/分页策略）。
* `POST /api/query/run`: 交互查询执行（受行数/字节/超时阈值约束）。
* `POST /api/profile/columns`: 计算列画像（缺失/分位数/TopN/直方图），支持异步降级。
* `POST /api/datasets`: 创建数据集（virtual/materialized）。
* `GET /api/datasets/{dataset_id}`: 获取数据集定义与版本信息。
* `POST /api/datasets/{dataset_id}/materialize`: 物化数据集（抽取/落地/生成新版本）。
* `POST /api/datasets/{dataset_id}/refresh`: 刷新数据集（定时/手动/增量策略）。
* `POST /api/federation/query`: 跨源实时查询（优先 Trino，失败可降级为 Job）。

#### 6.2.1 /api/connect（示例）

请求：

```json
{
  "type": "clickhouse",
  "name": "risk-ch",
  "config": {
    "host": "127.0.0.1",
    "port": 8123,
    "database": "risk",
    "username": "user"
  },
  "secret": {
    "password": "******"
  }
}
```

响应 data：

```json
{
  "connection_id": "conn_01J...",
  "status": "ok"
}
```

#### 6.2.2 /api/preview//

请求：

```json
{
  "columns": ["customer_id", "annual_inc", "bad_flag"],
  "filter": [
    { "op": "eq", "col": "snapshot_dt", "value": "2025-12-31" }
  ],
  "order_by": [{ "col": "customer_id", "dir": "asc" }],
  "page": { "limit": 200, "cursor": null }
}
```

响应 data：

```json
{
  "schema": [
    { "name": "customer_id", "type": "string" },
    { "name": "annual_inc", "type": "float" },
    { "name": "bad_flag", "type": "int" }
  ],
  "rows": [["c1", 120000.0, 0]],
  "next_cursor": "eyJvIjp7ImN1c3RvbWVyX2lkIjoiYzEifX0="
}
```

#### 6.2.3 /api/query/plan（QuerySpec -> ExecutionPlan）

请求（最小 QuerySpec）：

```json
{
  "source": { "type": "table", "connection_id": "conn_01J...", "table": "loan_data_v2" },
  "select": ["grade", "annual_inc"],
  "filter": [{ "op": "gte", "col": "issue_date", "value": "2025-01-01" }],
  "group_by": ["grade"],
  "aggregates": [{ "fn": "count", "as": "cnt" }],
  "order_by": [{ "col": "cnt", "dir": "desc" }],
  "page": { "limit": 50, "cursor": null },
  "sample": { "method": "none" }
}
```

响应 data（ExecutionPlan）：

```json
{
  "route": "pushdown",
  "engine": "clickhouse",
  "sql": "SELECT grade, count(*) AS cnt FROM loan_data_v2 WHERE issue_date >= '2025-01-01' GROUP BY grade ORDER BY cnt DESC LIMIT 50",
  "limits": { "timeout_ms": 8000, "max_rows": 10000, "max_bytes": 10485760 },
  "cache": { "cache_key": "q:sha256:...", "ttl_sec": 300 },
  "fallback": { "to_job_on_timeout": true }
}
```

#### 6.2.4 /api/query/run（交互执行 + 自动降级）

请求：

```json
{
  "plan": { "plan_id": "plan_01J..." },
  "mode": "interactive"
}
```

响应 data（同步返回）：

```json
{
  "status": "done",
  "artifact_id": "art_01J...",
  "preview": { "kind": "table", "rows": 50 }
}
```

响应 data（降级为 Job）：

```json
{
  "status": "accepted",
  "job_id": "job_01J...",
  "run_id": "run_01J..."
}
```

#### 6.2.5 /api/datasets（创建 Virtual/Materialized Dataset）

请求（创建 Virtual Dataset 示例）：

```json
{
  "project_id": "proj_01J...",
  "kind": "virtual",
  "name": "cross_source_loan_summary",
  "spec": {
    "sources": [
      { "alias": "a", "type": "table", "connection_id": "conn_mysql", "table": "loan_app" },
      { "alias": "b", "type": "table", "connection_id": "conn_ch", "table": "loan_label" }
    ],
    "joins": [
      { "left": "a.customer_id", "right": "b.customer_id", "type": "left" }
    ],
    "select": ["a.customer_id", "a.annual_inc", "b.bad_flag"],
    "filter": [{ "op": "gte", "col": "a.apply_dt", "value": "2025-01-01" }]
  },
  "refresh": { "mode": "manual" }
}
```

响应 data：

```json
{
  "dataset_id": "ds_01J...",
  "version": 1
}
```

#### 6.2.6 /api/datasets//materialize（抽取落地生成新版本）

请求：

```json
{
  "strategy": {
    "mode": "full",
    "partition_by": ["apply_dt"],
    "max_rows": null
  },
  "format": { "type": "parquet", "compression": "zstd" }
}
```

响应 data（异步为主）：

```json
{
  "status": "accepted",
  "job_id": "job_01J...",
  "dataset_id": "ds_01J...",
  "new_version": 2
}
```

#### 6.2.7 /api/federation/query（跨源实时分析）

请求：

```json
{
  "project_id": "proj_01J...",
  "query": {
    "source": { "type": "dataset", "dataset_id": "ds_01J..." },
    "group_by": ["bad_flag"],
    "aggregates": [{ "fn": "count", "as": "cnt" }],
    "limits": { "timeout_ms": 8000, "max_rows": 10000 }
  },
  "mode": "interactive"
}
```

响应 data（同步）：

```json
{
  "status": "done",
  "artifact_id": "art_01J..."
}
```

响应 data（降级为 Job）：

```json
{
  "status": "accepted",
  "job_id": "job_01J..."
}
```

### 项目/流程/任务相关接口（SAS EG 工作方式所需）

* `POST /api/projects`: 创建项目。
* `GET /api/projects/{project_id}`: 获取项目详情（树、引用、版本）。
* `POST /api/flows/{project_id}`: 保存/更新流程图（节点/边/参数）。
* `POST /api/tasks/run`: 运行单任务或子图（inputs + params）。
* `GET /api/jobs/{job_id}`: 获取任务运行状态与日志索引。
* `GET /api/artifacts/{artifact_id}`: 获取产物内容（表/图/摘要）与元信息。

#### 6.3.1 /api/tasks/run（预制任务统一契约）

请求：

```json
{
  "project_id": "proj_01J...",
  "tool_id": "missing",
  "input": { "dataset": { "type": "table", "connection_id": "conn_01J...", "table": "loan_data_v2" } },
  "params": { "columns": ["annual_inc", "dti"], "group_by": ["grade"] },
  "mode": "auto"
}
```

响应 data（同步返回）：

```json
{
  "status": "done",
  "artifact_ids": ["art_01J..."]
}
```

响应 data（异步）：

```json
{
  "status": "accepted",
  "run_id": "run_01J...",
  "job_id": "job_01J..."
}
```

#### 6.3.2 /api/jobs/

响应 data：

```json
{
  "job_id": "job_01J...",
  "status": "running",
  "progress": { "percent": 42, "stage": "profiling_columns" },
  "artifacts": [{ "artifact_id": "art_01J...", "kind": "summary", "name": "列画像" }],
  "logs": { "uri": "s3://artifacts/logs/job_01J....jsonl" }
}
```

#### 6.3.3 /api/artifacts/

响应 data（表类 Artifact 示例）：

```json
{
  "artifact_id": "art_01J...",
  "kind": "table",
  "meta": { "schema": [{ "name": "grade", "type": "string" }], "row_count": 50 },
  "content": { "rows": [["A"]], "next_cursor": null }
}
```

---

## 7. Non-Functional Requirements (非功能性需求)

本章节强调的是“保障能力”，用于支撑企业级分析能力的可用性与规模化落地。

### 7.1 性能与规模

- **交互查询**：95% 查询在可配置 SLA 内返回；超时可降级为异步任务。
- **20GB 级表分析**：默认只做采样/聚合/分页；全量扫描与大 Join 必须异步；结果以 Artifact 交付。
- **大数据预览**：默认只取样/分页，不允许一次性拉全表到前端或拉到后端内存。
- **缓存策略**：按（用户、SQL 签名、权限策略、数据版本）维度缓存结果与摘要。

### 7.2 安全与合规

- **最小权限**：默认无导出权限；导出与外发必须被策略显式允许。
- **敏感数据保护**：字段分级、脱敏、访问日志、审批链路（企业版）。
- **密钥管理**：数据库/模型 Key 不落前端，后端使用安全存储（实现形态可选）。

### 7.3 可观测与运维

- **审计**：查询/导出/模型调用/AI 调用全链路审计。
- **观测**：请求指标、任务队列指标、模型延迟、错误率、热点数据集。
- **告警**：连接失败率、任务失败率、模型不可用、权限拒绝异常波动。

---

## 8. Change Log (变更记录)

- v2.1：补全企业级架构扩展、交互流程、治理与非功能性需求章节。
- v2.2：重心调整为企业级分析能力（语义层/加速/资产化/工作流），保障能力下沉。
- v2.3：补齐右侧工具栏预制分析能力与一键出结果交互，强调资产沉淀。
- v2.4：主工作区对标 SAS EG（项目/流程/结果），补齐架构、优先级与开发流程。
- v2.5（2026-01-15）：明确 20GB 级表分析选型（下推/Out-of-core/异步），补齐路由阈值/分页策略/渐进式结果与缓存，更新 MVP 技术栈默认引擎与相关 API 草案。
- v2.6（2026-01-15）：补全端到端可落地架构（前端/后端/存储/队列/部署），补齐后端服务拆分、工程结构与可直接开发的 API 契约。
- v2.7（2026-01-15）：增加本地数据分析模块（Local Data Hub）与跨源实时联邦分析（Trino），补齐数据集（virtual/materialized）模型与物化/刷新/联邦查询接口。
- v2.8（2026-01-15）：明确控制面/执行面拆分与演进路线，补齐可替换为 Java 的服务边界与契约治理要点。
