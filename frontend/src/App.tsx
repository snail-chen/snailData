import { Sidebar } from './components/layout/Sidebar';
import { ToolkitPanel } from './components/layout/ToolkitPanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { DataGridTab } from './features/grid/DataGridTab';
import { StatsTab } from './features/analysis/StatsTab';
import { HybridLab } from './features/sql/SQLLab';
import { useAppStore } from './store/useAppStore';
import { useViewStore, type ViewType } from './store/useViewStore';
import { ShieldCheck, Database, Zap, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from './lib/utils';

// Helper for View Content
function ViewContent() {
  const { activeView, activeDatasetId } = useViewStore();

  if (activeView === 'dashboard') {
    return (
      <div className="h-full w-full relative bg-white p-6 flex flex-col">
        <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Analysis Dashboard: {activeDatasetId}
        </h2>
        <div className="flex-1 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
          Visual Analytics Component Placeholder
        </div>
      </div>
    );
  }

  if (activeView === 'data') {
    return (
      <div className="h-full w-full bg-white relative">
        <DataGridTab datasetId={activeDatasetId || 'loan_data_v2'} />
      </div>
    );
  }

  if (activeView === 'stats') {
    return (
      <div className="h-full w-full bg-white relative">
        <StatsTab datasetId={activeDatasetId || 'loan_data_v2'} />
      </div>
    );
  }

  if (activeView === 'sql') {
    return (
      <div className="h-full w-full bg-white relative">
        <HybridLab />
      </div>
    );
  }

  if (activeView === 'model') {
    return <div className="p-8 text-slate-400">Model Center View (Placeholder)</div>;
  }

  return <div className="p-8 text-slate-400">View: {activeView}</div>;
}

function App() {
  const { toggleLeft, toggleRight, toggleBottom, leftOpen, rightOpen, bottomOpen, toggleFullScreen, isFullScreen } = useAppStore();
  const { activeView, setActiveView } = useViewStore();

  const handleTabClick = (view: ViewType) => {
    setActiveView(view);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">

      {/* Header */}
      <header className="h-12 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 z-50 flex-none">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-slate-900 font-bold text-sm tracking-tight">ApexRisk AI</span>
          <div className="h-5 w-[1px] bg-slate-200 mx-2"></div>
          <nav className="flex p-0.5 bg-slate-100 rounded-lg space-x-0.5">
            <button onClick={() => handleTabClick('dashboard')} className={cn("micro-tab", activeView === 'dashboard' && "active")}>Analysis</button>
            <button onClick={() => handleTabClick('data')} className={cn("micro-tab", activeView === 'data' && "active")}>Data Preview</button>
            <button onClick={() => handleTabClick('sql')} className={cn("micro-tab", activeView === 'sql' && "active")}>SQL Lab</button>
            <button onClick={() => handleTabClick('model')} className={cn("micro-tab", activeView === 'model' && "active")}>Model Center</button>
            <button onClick={() => handleTabClick('stats')} className={cn("micro-tab", activeView === 'stats' && "active")}>Stats</button>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleFullScreen} className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase flex items-center gap-1" title="Toggle Full Screen">
            {isFullScreen ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
            {isFullScreen ? 'Exit' : 'Full'}
          </button>
          <div className="w-7 h-7 rounded-full border border-slate-200 bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            RA
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 relative">

        {/* Wake Handles */}
        {!leftOpen && (
          <button onClick={toggleLeft} className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:scale-110 transition-transform">
            <Database className="w-4 h-4" />
          </button>
        )}
        {!rightOpen && (
          <button onClick={toggleRight} className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-orange-500 hover:scale-110 transition-transform">
            <Zap className="w-4 h-4" />
          </button>
        )}
        {!bottomOpen && (
          <button onClick={toggleBottom} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-10 h-6 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:scale-110 transition-transform">
            <ChevronUp className="w-4 h-4" />
          </button>
        )}

        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col gap-3 min-w-0">
          <section className="flex-1 glass-card flex flex-col relative overflow-hidden bg-white">
            <div className="flex-1 overflow-hidden relative">
              <ViewContent />
            </div>
          </section>

          {/* Bottom: AI Panel */}
          <BottomPanel />
        </main>

        {/* Right Sidebar */}
        <ToolkitPanel />

      </div>
    </div>
  )
}

export default App;
