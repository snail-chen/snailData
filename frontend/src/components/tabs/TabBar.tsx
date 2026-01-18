import { X, Table, FileCode, BarChart, FileText } from 'lucide-react';
import { useTabStore } from '../../store/useTabStore';
import type { TabType } from '../../store/useTabStore';
import { cn } from '../../lib/utils';

const ICONS: Record<TabType, any> = {
    GRID: Table,
    SQL: FileCode,
    CHART: BarChart,
    REPORT: FileText
};

const COLORS: Record<TabType, string> = {
    GRID: 'text-blue-500',
    SQL: 'text-purple-500',
    CHART: 'text-orange-500',
    REPORT: 'text-slate-500'
};

export function TabBar() {
    const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();

    return (
        <div className="h-9 border-b border-slate-100 flex items-center px-2 bg-slate-50/50 gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const Icon = ICONS[tab.type] || Table;
                const isActive = activeTabId === tab.id;

                return (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "group h-full px-3 flex items-center gap-2 text-xs font-bold border border-transparent border-b-0 rounded-t-lg cursor-pointer transition-all select-none min-w-[120px] max-w-[200px]",
                            isActive
                                ? "bg-white border-slate-200 text-blue-600 shadow-sm relative top-[1px]"
                                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-700"
                        )}
                    >
                        <Icon className={cn("w-3.5 h-3.5", isActive ? COLORS[tab.type] : "opacity-70")} />
                        <span className="truncate flex-1">{tab.title}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                            className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded p-0.5 text-slate-400 hover:text-red-500 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
