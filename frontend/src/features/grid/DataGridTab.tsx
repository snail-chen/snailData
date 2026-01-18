import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

interface DataGridTabProps {
    datasetId: string;
}

import { Filter, Play } from 'lucide-react';

export function DataGridTab({ datasetId }: DataGridTabProps) {
    const [rowData, setRowData] = useState<any[]>([]);
    const [colDefs, setColDefs] = useState<ColDef[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const tableName = datasetId;
            const res = await fetch('http://localhost:8000/api/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_name: tableName,
                    limit: 100,
                    filter: filterQuery
                })
            });

            if (res.ok) {
                const data = await res.json();
                const newColDefs: ColDef[] = data.columns.map((col: any) => ({
                    field: col.field,
                    headerName: col.headerName,
                    filter: true,
                    sortable: true,
                    valueFormatter: col.type === 'numeric' ? (params: any) => params.value?.toLocaleString() : undefined
                }));

                setColDefs(newColDefs);
                setRowData(data.data);
            } else {
                console.error("Failed to fetch preview data");
            }
        } catch (err) {
            console.error("Error fetching preview:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (datasetId) {
            // Reset filter when dataset changes
            setFilterQuery('');
            // We need to fetch data, but can't call fetchData directly in dependency of itself
            // So we define a slightly different approach or just call it here 
            // but we need the 'empty' filter logic to run once.

            // To be safe and simple, let's just trigger a fetch with empty filter manually or via a separate effect
            // See below implementation
        }
    }, [datasetId]);

    // Initial load
    useEffect(() => {
        if (datasetId) {
            fetchData();
        }
    }, [datasetId]);

    const handleRunFilter = () => {
        fetchData();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRunFilter();
        }
    };

    if (isLoading && !rowData.length) {
        return (
            <div className="h-full w-full flex items-center justify-center text-slate-400">
                <span className="animate-pulse">Loading data...</span>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            {/* Filter Toolbar */}
            <div className="h-10 border-b border-slate-200 bg-white flex items-center px-3 gap-2 flex-none">
                <div className="flex items-center text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-1 flex-1 h-7">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Filter... (e.g. loan_amount > 10000 AND grade = 'A')"
                        className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder:text-slate-400"
                    />
                </div>
                <button
                    onClick={handleRunFilter}
                    disabled={isLoading}
                    className="h-7 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 hover:border-blue-200 transition-colors flex items-center disabled:opacity-50"
                >
                    <Play className="w-3 h-3 mr-1.5 fill-current" />
                    Run
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 ag-theme-quartz relative" style={{ '--ag-font-family': 'Inter, sans-serif', '--ag-font-size': '12px' } as any}>
                {isLoading && (
                    <div className="absolute inset-0 z-50 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="animate-pulse text-xs font-bold text-blue-600">Updating...</span>
                    </div>
                )}
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={{ resizable: true, sortable: true }}
                    rowSelection="multiple"
                    rowHeight={32}
                    headerHeight={36}
                />
            </div>
        </div>
    );
}
