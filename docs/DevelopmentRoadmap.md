# DataSnail Development Roadmap (Master Plan)

**Last Updated**: 2026-01-16
**Status**: Planning Complete
**Strategy**: Visual-First, Feature-Driven Validation

This document tracks the execution of the DataSnail (Apex Risk AI) MVP. Tasks are organized by "Functional Vertical Slices" to ensuring feature completeness at every step.

---

## 📅 Phase 1: Workbench Foundation (P0)
**Goal**: Build the "Operating System" UI (Shell, Layout, Tabs).
**Priority**: Critical. No other feature works without this container.

- [x] **[F01] Application Shell & Layout**
    - [x] **Tech**: React + Tailwind + Zustand.
    - [x] **Deliverable**: A 4-pane interactive layout (Left/Center/Right/Bottom) matching `demo.html`.
    - [x] **Tasks**:
        - [x] Left Sidebar (Accordion Resource Tree).
        - [x] Right Sidebar (Risk Toolkit Container).
        - [x] Bottom Panel (AI Dashboard Shell).
        - [x] Top Header (Nav & User Profile).

- [x] **[F02] Tab Management System**
    - [x] **Tech**: Zustand Store `useTabStore`.
    - [x] **Deliverable**: A robust tab bar allowing open/close/switch.
    - [x] **Tasks**:
        - [x] `TabBar` Component.
        - [x] State Logic (Active Tab persistence).
        - [x] Support Types: `GRID` (Data), `VIS` (Chart), `SQL` (Editor).

---

## 📅 Phase 2: Data Access Capability (P0)
**Goal**: Enable "Read" capability. Connect to DB and View Data.
**Priority**: Blocker for real analysis.

- [x] **[F03] Connectivity**
    - [x] **Tech**: FastAPI + SQLAlchemy.
    - [x] **Deliverable**: `POST /connect` API and UI Wizard.
    - [x] **Tasks**:
        - [x] UI: Connection Modal (Host/Port/User/Pass).
        - [x] Backend: Connection Manager Service (Mocked).
        - [x] Backend: Test Connectivity Logic.

- [x] **[F04] Schema Introspection**
    - [x] **Tech**: SQLAlchemy Inspection.
    - [x] **Deliverable**: Left Sidebar populated with real DB Trees.
    - [x] **Tasks**:
        - [x] API: `GET /schema/{conn_id}` (Lazy Loading).
        - [x] Backend: Metadata Scanner (Mocked).
        - [x] UI: Async TreeView Component.

- [x] **[F05] Data Preview Grid**
    - [x] **Tech**: AG Grid + DuckDB/SQLGlot.
    - [x] **Deliverable**: Million-row scrolling in `DataGridTab`.
    - [x] **Tasks**:
        - [x] UI: `AgGridTab` component with Server-side Row Model.
        - [x] Backend: `ExecutionService` (Pagination Pushdown).
        - [x] Backend: API `POST /preview`.

---

## 📅 Phase 3: Exploratory Analysis (P1)
**Goal**: Enable "Data Probe" (Basic Stats & Quality).
**Priority**: High. First analytical value prop.

- [ ] **[F06] Toolkit Framework**
    - [ ] **Tech**: React Context + Dynamic Slot.
    - [ ] **Deliverable**: Clicking a tool runs it against active tab.
    - [ ] **Tasks**:
        - [ ] Action Logic: `ActiveTab -> Context -> API -> NewTab`.
        - [ ] UI: Right Sidebar Tools List.

- [ ] **[F07] Stats & Distribution**
    - [ ] **Tech**: DuckDB Aggregations.
    - [ ] **Deliverable**: "Distribution" tab with Histograms.
    - [ ] **Tasks**:
        - [ ] UI: ECharts Histogram.
        - [ ] Backend: `POST /analyze/stats`.
        - [ ] Logic: 1-Pass Aggregation Query.

---

## 📅 Phase 4: Risk Modeling Tools (P2)
**Goal**: Enable "Financial Specific" workflows.
**Priority**: Medium. Difference maker vs generic tools.

- [ ] **[F08] WOE Binning**
    - [ ] **Tech**: Python Risk Library.
    - [ ] **Deliverable**: Interactive Binning Editor.
    - [ ] **Tasks**:
        - [ ] Backend: Monotonic Binning Algorithm.
        - [ ] UI: Drag-and-drop Bin Adjuster.
        - [ ] Metric: IV (Information Value) Calculation.

- [ ] **[F09] Stability (PSI)**
    - [ ] **Tech**: Numpy/DuckDB.
    - [ ] **Deliverable**: PSI Monitoring Chart.

---

## 📅 Phase 5: AI Co-Pilot (P3)
**Goal**: Intelligent Assistance.
**Priority**: Low (Enhancement).

- [ ] **[F10] Chat Integration**
    - [ ] **Tech**: OpenAI API / Local Service.
    - [ ] **Deliverable**: "Ask Data" capability.
    - [ ] **Tasks**:
        - [ ] `ContextManager`: Serialize Tab Schema to Prompt.
        - [ ] UI: Streaming Chat Bubble.
