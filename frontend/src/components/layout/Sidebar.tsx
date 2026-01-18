import { useState, useEffect } from 'react';
import { Database, ChevronRight, Plus, Settings, ListChecks, History, PanelLeftClose } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

import { Resizer } from './Resizer';
import { ConnectionModal } from '../../features/connections/ConnectionModal';
import { SchemaTree } from '../../features/catalog/SchemaTree';

// Helper for Accordion logic
interface AccordionProps {
    title: string;
    icon: any;
    color: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    onAdd?: (e: React.MouseEvent) => void;
}

function Accordion({ title, icon: Icon, color, children, defaultOpen = false, onAdd }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-50 last:border-0 pb-1">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer group select-none"
            >
                <div className="flex items-center text-xs font-bold text-slate-600">
                    <ChevronRight className={cn("w-3 h-3 mr-2 transition-transform duration-200", isOpen && "rotate-90")} />
                    <Icon className={cn("w-3.5 h-3.5 mr-2", color)} />
                    {title}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onAdd && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdd(e);
                            }}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                    <Settings className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </div>
            </div>

            <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    )
}

export function Sidebar() {
    const { leftOpen, toggleLeft, leftWidth, setLeftWidth } = useAppStore();
    // Removed unused useViewStore
    const [connections, setConnections] = useState<any[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchConnections = () => {
        fetch('http://localhost:8000/api/connections')
            .then(res => res.json())
            .then(data => setConnections(data))
            .catch(err => console.error('Failed to fetch connections:', err));
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    if (!leftOpen) return null;

    return (
        <>
            <ConnectionModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchConnections}
            />
            <aside
                className="flex-none flex flex-col gap-4 sidebar-anim transition-all duration-75 relative group/sidebar"
                style={{ width: leftWidth }}
            >
                <div className="glass-card flex-1 flex flex-col overflow-hidden h-full relative">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explorer</span>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setIsAddOpen(true)} className="text-slate-300 hover:text-blue-600 transition-colors" title="Add Connection">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={toggleLeft} className="text-slate-300 hover:text-blue-600 transition-colors">
                                <PanelLeftClose className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">

                        <Accordion
                            title="DATABASE"
                            icon={Database}
                            color="text-blue-500"
                            defaultOpen={true}
                            onAdd={() => setIsAddOpen(true)}
                        >
                            <div className="px-2 space-y-1 mt-1">
                                {connections.map((conn) => (
                                    <SchemaTree key={conn.id} connection={conn} />
                                ))}
                                {connections.length === 0 && (
                                    <div className="text-[10px] text-slate-400 p-2 italic">No connections found.</div>
                                )}
                            </div>
                        </Accordion>

                        <Accordion title="SCHEMA PREVIEW" icon={ListChecks} color="text-purple-500">
                            <div className="px-3 space-y-2 mt-1 mb-2">
                                <div className="flex justify-between border-b border-slate-50 pb-1">
                                    <span className="text-slate-500 text-[11px] font-medium">user_id</span>
                                    <span className="text-[9px] bg-blue-100 text-blue-600 px-1 rounded font-bold">PK</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-1">
                                    <span className="text-slate-500 text-[11px] font-medium">annual_inc</span>
                                    <span className="text-[9px] text-red-500 font-bold">M: 15%</span>
                                </div>
                            </div>
                        </Accordion>

                        <Accordion title="HISTORY" icon={History} color="text-orange-400">
                            <div className="px-3 text-[10px] text-slate-400 italic py-1">
                                Last session: WOE Analysis 10:42 AM...
                            </div>
                        </Accordion>

                        <SessionTableList />

                    </div>
                </div>

                {/* Resizer Handle (Right Edge) */}
                <Resizer
                    orientation="vertical"
                    className="right-0 hover:bg-blue-400 opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
                    onResize={(delta) => setLeftWidth(Math.max(180, Math.min(600, leftWidth + delta)))}
                />
            </aside>
        </>
    );
}

import { useSessionStore } from '../../store/useSessionStore';
import { Table, FileText } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';

function SessionTableList() {
    const { tables } = useSessionStore();
    const { setActiveView, setActiveDatasetId, activeDatasetId } = useViewStore();

    return (
        <Accordion title="WORKSPACE" icon={FileText} color="text-green-500" defaultOpen={true}>
            <div className="px-2 space-y-1 mt-1">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        onClick={() => {
                            setActiveDatasetId(table.name);
                            setActiveView('data');
                        }}
                        className={cn(
                            "flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group transition-colors",
                            activeDatasetId === table.name ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"
                        )}
                    >
                        <div className="flex items-center min-w-0">
                            <Table className={cn("w-3.5 h-3.5 mr-2 flex-shrink-0", activeDatasetId === table.name ? "text-blue-500" : "text-slate-400")} />
                            <span className="text-xs truncate font-medium">{table.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                            {table.rowCount.toLocaleString()} rows
                        </span>
                    </div>
                ))}
                {tables.length === 0 && (
                    <div className="text-[10px] text-slate-400 p-2 italic">No session tables. Run SQL to generate.</div>
                )}
            </div>
        </Accordion>
    )
}
