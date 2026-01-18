
import React, { useState, useEffect } from 'react';
import { Database, FileCode, Play, Box, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

interface Variable {
    name: string;
    type: string;
    rows: number;
    cols: number;
    preview: any;
}

const VariableExplorer: React.FC = () => {
    const { tables: sessionTables } = useSessionStore();
    const [variables, setVariables] = useState<Variable[]>([]);

    // Polling mocked for now, real app would verify session_id
    useEffect(() => {
        const fetchVars = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/python/variables?session_id=default');
                if (res.ok) {
                    const data = await res.json();
                    setVariables(data);
                }
            } catch (e) {
                // Squelch errors for now
            }
        };
        const interval = setInterval(fetchVars, 2000);
        return () => clearInterval(interval);
    }, []);

    const handlePublish = async (varName: string) => {
        try {
            await fetch('http://localhost:8000/api/python/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: 'default', var_name: varName })
            });
            // Trigger refresh or notification?
            // In a better integrated system, we'd update useSessionStore here too
        } catch (e) {
            alert("Failed to publish");
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200 w-64 overflow-y-auto">
            {/* Published Tables Section */}
            <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Published Tables</h3>
                <div className="space-y-1">
                    {sessionTables.map((table) => (
                        <div key={table.id} className="group flex items-center p-2 hover:bg-white rounded border border-transparent hover:border-blue-200 cursor-pointer text-sm">
                            <Database size={14} className="text-blue-600 mr-2" />
                            <div className="flex-1 truncate">
                                <div className="font-medium text-gray-700">{table.name}</div>
                                <div className="text-xs text-gray-400">{table.rowCount} rows • {new Date(table.createdAt).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    ))}
                    {sessionTables.length === 0 && (
                        <div className="text-xs text-gray-400 italic px-2">No tables published yet.</div>
                    )}
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Runtime Variables Section */}
            <div className="p-2 flex-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Runtime Variables</span>
                    <span className="bg-green-100 text-green-700 px-1 rounded text-[10px]">PYTHON</span>
                </h3>
                <div className="space-y-1">
                    {variables.map((v) => (
                        <div key={v.name} className="group flex items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
                            <Box size={14} className="text-green-600 mr-2" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 truncate">{v.name}</div>
                                <div className="text-xs text-gray-500">{v.rows}x{v.cols} DataFrame</div>
                            </div>
                            <button
                                onClick={() => handlePublish(v.name)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 text-blue-600 rounded"
                                title="Publish to SQL"
                            >
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    ))}
                    {variables.length === 0 && (
                        <div className="text-xs text-gray-400 italic px-2">No active variables.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VariableExplorer;
