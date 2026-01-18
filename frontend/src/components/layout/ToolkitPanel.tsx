import { useAppStore } from '../../store/useAppStore';
import { useViewStore } from '../../store/useViewStore';
import { cn } from '../../lib/utils';
import { BarChart2, Zap, Search, AlertTriangle, Copy, ArrowRightLeft, ChevronRight, PanelRightClose } from 'lucide-react';
import { Resizer } from './Resizer';

export function ToolkitPanel() {
    const { rightOpen, toggleRight, rightWidth, setRightWidth } = useAppStore();
    const { setActiveView, setActiveAnalysisType } = useViewStore();

    if (!rightOpen) return null;

    const handleToolClick = (type: 'distribution' | 'missing' | 'outlier' | 'dupes') => {
        setActiveAnalysisType(type);
        setActiveView('stats');
    };

    return (
        <aside
            className="flex-none flex flex-col gap-4 transition-all duration-75 relative group/toolkit"
            style={{ width: rightWidth }}
        >
            {/* Resizer Handle (Left Edge) */}
            <Resizer
                orientation="vertical"
                className="left-0 hover:bg-blue-400 opacity-0 group-hover/toolkit:opacity-100 transition-opacity"
                onResize={(delta) => setRightWidth(Math.max(180, Math.min(600, rightWidth - delta)))}
            />

            <div className="glass-card flex-1 flex flex-col overflow-hidden h-full">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <button onClick={toggleRight} className="text-slate-300 hover:text-blue-600 transition-colors">
                        <PanelRightClose className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Toolkit</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4">

                    {/* Active Source */}
                    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">loan_data_v2</span>
                        </div>
                        {/* Mock Select */}
                        <div className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 bg-white flex justify-between items-center text-slate-700 cursor-pointer hover:border-blue-300 transition-colors">
                            <span>loan_data_v2 (Hive)</span>
                            <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
                        </div>
                    </div>

                    {/* Group 1: Data Probe */}
                    <div>
                        <div className="flex items-center text-[10px] font-bold text-slate-400 p-1 mb-2 uppercase cursor-pointer hover:text-slate-600">
                            <ChevronRight className="w-3 h-3 mr-1.5 rotate-90" />
                            01 Data Probe
                        </div>
                        <div className="grid grid-cols-2 gap-2 px-1">
                            <ToolCard
                                icon={Search}
                                label="Missing"
                                color="text-blue-500"
                                onClick={() => handleToolClick('missing')}
                            />
                            <ToolCard
                                icon={AlertTriangle}
                                label="Outlier"
                                color="text-red-500"
                                onClick={() => handleToolClick('outlier')}
                            />
                            <ToolCard
                                icon={Copy}
                                label="Dupes"
                                color="text-slate-500"
                                onClick={() => handleToolClick('dupes')}
                            />
                            <ToolCard
                                icon={BarChart2}
                                label="Dist"
                                color="text-indigo-500"
                                onClick={() => handleToolClick('distribution')}
                            />
                        </div>
                    </div>

                    {/* Group 2: Feature Eng */}
                    <div>
                        <div className="flex items-center text-[10px] font-bold text-blue-600 p-1 mb-2 uppercase cursor-pointer">
                            <ChevronRight className="w-3 h-3 mr-1.5 rotate-90" />
                            02 Feature Eng
                        </div>
                        <div className="space-y-2 px-1">
                            <div className="p-3 bg-white border-2 border-blue-100 rounded-xl shadow-sm flex items-center hover:shadow-md cursor-pointer transition-all group">
                                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white mr-3 shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                                    <BarChart2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-700">WOE Binning</p>
                                    <p className="text-[9px] text-slate-400">IV & Monotonicity</p>
                                </div>
                            </div>

                            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center hover:shadow-md cursor-pointer transition-all">
                                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded flex items-center justify-center mr-3">
                                    <ArrowRightLeft className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600">PCA Reduce</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside >
    );
}

function ToolCard({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="p-2 border border-slate-100 rounded-lg bg-slate-50 text-center hover:border-blue-300 hover:bg-white cursor-pointer transition-all"
        >
            <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
            <span className="text-[9px] font-bold text-slate-600">{label}</span>
        </div>
    )
}
