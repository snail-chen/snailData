import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { ChevronDown, Send, Sparkles } from 'lucide-react';
import { Resizer } from './Resizer';

export function BottomPanel() {
    const { bottomOpen, toggleBottom, bottomHeight, setBottomHeight } = useAppStore();

    return (
        <section
            className={cn("flex-none flex flex-col transition-all duration-75 relative sidebar-anim",
                bottomOpen ? "" : "h-0 overflow-hidden"
            )}
            style={{ height: bottomOpen ? bottomHeight : 0 }}
        >
            {/* Resizer Handle (Top Edge) */}
            {bottomOpen && (
                <Resizer
                    orientation="horizontal"
                    className="top-0 hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                    onResize={(delta) => setBottomHeight(Math.max(80, Math.min(600, bottomHeight - delta)))}
                />
            )}

            <div className="glass-card flex-1 flex flex-col overflow-hidden border-blue-50 mx-4 mb-4 mt-1">
                {/* Header */}
                <div className="h-8 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase italic">Copilot Dashboard</span>
                    </div>
                    <button onClick={toggleBottom} className="text-slate-300 hover:text-slate-600">
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/50">
                    {/* Mock Message */}
                    <div className="flex space-x-3 items-start">
                        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] shadow-lg flex-shrink-0">
                            AI
                        </div>
                        <div className="flex-1 bg-blue-50/50 p-2 px-3 rounded-2xl rounded-tl-none border border-blue-100 text-xs text-slate-600 leading-relaxed shadow-sm">
                            <b>loan_data_v2</b> mounted. Detected <span className="text-red-500 font-bold">outliers</span> in annual_inc.
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-3 pt-0 bg-white/50">
                    <div className="border-2 border-slate-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 rounded-xl flex items-center p-1 px-2 bg-white transition-all shadow-sm">
                        <div className="text-blue-600 font-bold text-[10px] pr-2 border-r border-slate-100 mr-2">PROMPT</div>
                        <input
                            type="text"
                            placeholder="Ask analysis questions..."
                            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-300 h-8 w-full"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-md">
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
