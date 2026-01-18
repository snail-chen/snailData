
import { useState, useRef, useEffect } from 'react';
import { Play, Eraser, Save, Plus, FileCode, Trash2, Database, Box } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useScriptStore } from '../../store/useScriptStore';
import { cn } from '../../lib/utils';
import VariableExplorer from './VariableExplorer';

export function HybridLab() {
    const { scripts, activeScriptId, addScript, updateScript, setActiveScript, deleteScript, activeLanguage } = useScriptStore();
    const activeScript = scripts.find(s => s.id === activeScriptId);

    // Sidebar Mode: 'scripts' (Old) or 'explorer' (New Variable Explorer)
    const [sidebarMode, setSidebarMode] = useState<'scripts' | 'explorer'>('scripts');

    const [isExecuting, setIsExecuting] = useState(false);
    const [runMode, setRunMode] = useState<'full' | 'selection'>('full');
    const [execOutput, setExecOutput] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { addTable } = useSessionStore();

    // Check selection
    const checkSelection = () => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            setRunMode(start !== end ? 'selection' : 'full');
        }
    };

    // Auto-switch Sidebar based on Language
    useEffect(() => {
        if (activeScript?.language === 'python') {
            setSidebarMode('explorer');
        } else {
            setSidebarMode('scripts');
        }
    }, [activeScript?.language]);

    const handleRun = async () => {
        if (!activeScript) return;

        setIsExecuting(true);
        setExecOutput(null);

        let codeToRun = activeScript.content;

        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            if (start !== end) {
                codeToRun = activeScript.content.substring(start, end);
            }
        }

        if (activeScript.language === 'python') {
            // Python Execution
            try {
                const res = await fetch('http://localhost:8000/api/python/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: 'default', code: codeToRun })
                });
                const data = await res.json();

                if (data.status === 'success') {
                    setExecOutput(data.stdout || 'Done (No Output)');
                } else {
                    setExecOutput(`Error:\n${data.error}`);
                }
            } catch (e) {
                setExecOutput('Network Error: Failed to reach backend');
            }
            setIsExecuting(false);
        } else {
            // SQL Execution (Mocked Simulation)
            setTimeout(() => {
                const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
                const tableName = `result_${timestamp}`;
                const rowCount = Math.floor(Math.random() * 5000) + 100;

                addTable({
                    id: tableName,
                    name: tableName,
                    rowCount: rowCount,
                    createdAt: new Date(),
                    type: 'table'
                });
                setExecOutput(`Query executed successfully.\nTable '${tableName}' generated.`);
                setIsExecuting(false);
            }, 800);
        }
    };

    return (
        <div className="h-full flex bg-slate-50">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
                {/* Mode Switcher */}
                <div className="h-10 flex border-b border-slate-200">
                    <button
                        onClick={() => setSidebarMode('scripts')}
                        className={cn("flex-1 text-xs font-bold uppercase transition-colors", sidebarMode === 'scripts' ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600")}
                    >
                        Scripts
                    </button>
                    <button
                        onClick={() => setSidebarMode('explorer')}
                        className={cn("flex-1 text-xs font-bold uppercase transition-colors", sidebarMode === 'explorer' ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600")}
                    >
                        Variables
                    </button>
                </div>

                {sidebarMode === 'explorer' ? (
                    <VariableExplorer />
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="h-8 border-b border-slate-100 flex items-center justify-between px-3 bg-slate-50">
                            <span className="text-[10px] text-slate-500 font-medium">ALL FILES</span>
                            <div className="flex gap-1">
                                <button onClick={() => addScript('sql')} title="New SQL" className="p-1 hover:bg-white rounded text-blue-500 hover:text-blue-700">
                                    <Database className="w-3 h-3" />
                                </button>
                                <button onClick={() => addScript('python')} title="New Python" className="p-1 hover:bg-white rounded text-green-500 hover:text-green-700">
                                    <Box className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {scripts.map(script => (
                                <div
                                    key={script.id}
                                    onClick={() => setActiveScript(script.id)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs group transition-colors",
                                        activeScriptId === script.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className="flex items-center truncate">
                                        {script.language === 'python' ? (
                                            <Box className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-green-600 opacity-70" />
                                        ) : (
                                            <FileCode className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-blue-600 opacity-70" />
                                        )}
                                        <span className="truncate">{script.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteScript(script.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Editor */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="h-12 border-b border-slate-200 bg-white flex items-center px-4 gap-2 flex-none">
                    <button
                        onClick={handleRun}
                        disabled={isExecuting || !activeScript}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 text-white rounded text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[100px] justify-center",
                            activeScript?.language === 'python' ? "bg-green-600" : "bg-blue-600"
                        )}
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {isExecuting ? 'Running...' : runMode === 'selection' ? 'Run Selection' : `Run ${activeScript?.language === 'python' ? 'Python' : 'SQL'}`}
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded">
                        <Save className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded">
                        <Eraser className="w-4 h-4" />
                    </button>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 p-4 overflow-hidden flex flex-col">
                        {activeScript ? (
                            <div className="w-full h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between flex-none">
                                    <span className="text-xs font-bold text-slate-500">{activeScript.name}</span>
                                    <span className="text-[10px] text-slate-400 uppercase">{activeScript.language} Kernel</span>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    value={activeScript.content}
                                    onChange={(e) => updateScript(activeScript.id, e.target.value)}
                                    onSelect={checkSelection}
                                    onClick={checkSelection}
                                    onKeyUp={checkSelection}
                                    className={cn(
                                        "flex-1 w-full p-4 font-mono text-sm text-slate-700 resize-none outline-none transition-colors",
                                        activeScript.language === 'python' ? "focus:bg-green-50/10" : "focus:bg-blue-50/10"
                                    )}
                                    spellCheck={false}
                                    placeholder={`Write your ${activeScript.language} code here...`}
                                />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                                Select a script or create new.
                            </div>
                        )}
                    </div>

                    {/* Output Panel (Python Console Style) */}
                    {execOutput && (
                        <div className="h-32 bg-slate-900 text-slate-300 font-mono text-xs p-3 overflow-auto border-t border-slate-200 flex-none">
                            <pre className="whitespace-pre-wrap">{execOutput}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
