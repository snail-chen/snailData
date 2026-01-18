import { useState } from 'react';
import { ChevronRight, Table, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useViewStore } from '../../store/useViewStore';

interface SchemaTreeProps {
    connection: {
        id: string;
        name: string;
        type: string;
    };
}

export function SchemaTree({ connection }: SchemaTreeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [tables, setTables] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const { setActiveView, setActiveDatasetId } = useViewStore();

    const toggleExpand = async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        setIsExpanded(true);

        if (!hasLoaded) {
            setIsLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/api/schema/${connection.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTables(data.tables || []);
                    setHasLoaded(true);
                } else {
                    console.error("Failed to fetch schema");
                }
            } catch (error) {
                console.error("Schema fetch error", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="mb-1">
            {/* Connection Item */}
            <div
                onClick={toggleExpand}
                className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
            >
                <ChevronRight
                    className={cn(
                        "w-3 h-3 mr-1.5 text-slate-400 transition-transform duration-200",
                        isExpanded && "rotate-90"
                    )}
                />
                <div className="flex-1 flex items-center min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 flex-shrink-0 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-slate-700 truncate pr-2" title={connection.name}>
                        {connection.name}
                    </span>
                </div>
                {isLoading && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                <span className="text-[9px] text-slate-400 uppercase hidden group-hover:block">{connection.type}</span>
            </div>

            {/* Tables List */}
            {isExpanded && (
                <div className="ml-5 border-l border-slate-200 pl-2 mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {tables.map(table => (
                        <div
                            key={table.name}
                            onDoubleClick={() => {
                                setActiveDatasetId(table.name);
                                setActiveView('data');
                            }}
                            className="flex items-center p-1.5 rounded hover:bg-blue-50 cursor-pointer group/table transition-colors"
                        >
                            <Table className="w-3 h-3 mr-2 text-blue-500 opacity-70" />
                            <span className="text-[11px] text-slate-600 font-medium truncate flex-1">
                                {table.name}
                            </span>
                            <span className="text-[9px] text-slate-300 hidden group-hover/table:inline-block">
                                TABLE
                            </span>
                        </div>
                    ))}
                    {!isLoading && tables.length === 0 && hasLoaded && (
                        <div className="text-[10px] text-slate-400 pl-2 italic">No tables found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
