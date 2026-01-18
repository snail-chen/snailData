import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';

interface StatsTabProps {
    datasetId: string;
}

export function StatsTab({ datasetId }: StatsTabProps) {
    const { activeAnalysisType } = useViewStore();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:8000/api/analyze/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table_name: datasetId,
                        column: 'loan_amount', // TODO: Make this dynamic based on selection
                        type: activeAnalysisType || 'distribution'
                    })
                });

                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Analysis Failed", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (datasetId) {
            fetchStats();
        }
    }, [datasetId, activeAnalysisType]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span className="text-sm font-bold">Computing {activeAnalysisType}...</span>
            </div>
        );
    }

    if (!data) return null;

    // Transform API data format to Recharts format
    const chartData = data.data.xAxis.map((label: string, idx: number) => ({
        name: label,
        value: data.data.series[0].data[idx]
    }));

    const typeLabel = activeAnalysisType === 'missing' ? 'MISSING'
        : activeAnalysisType === 'outlier' ? 'OUTLIER'
            : activeAnalysisType === 'dupes' ? 'DUPES'
                : activeAnalysisType === 'correlation' ? 'CORR'
                    : 'DIST';

    const typeColor = activeAnalysisType === 'missing' ? 'text-blue-700 bg-blue-100'
        : activeAnalysisType === 'outlier' ? 'text-red-700 bg-red-100'
            : activeAnalysisType === 'dupes' ? 'text-slate-700 bg-slate-100'
                : activeAnalysisType === 'correlation' ? 'text-purple-700 bg-purple-100'
                    : 'text-indigo-700 bg-indigo-100';
    
    // Heatmap Logic
    const isHeatmap = data.chart_type === 'heatmap';

    return (
        <div className="h-full w-full p-6 bg-slate-50 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className={`p-2 rounded-lg mr-3 text-sm uppercas ${typeColor}`}>{typeLabel}</span>
                {data.title}
            </h2>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-[400px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Visualization</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        {isHeatmap ? (
                            <Heatmap 
                                xLabels={data.data.xAxis} 
                                yLabels={data.data.yAxis} 
                                data={data.data.series[0].data} 
                            />
                        ) : (
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="value" fill={activeAnalysisType === 'outlier' ? '#ef4444' : '#6366f1'} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-[400px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Summary Statistics</h3>
                    <div className="space-y-4">
                        <StatRow label="Count" value={data.data.summary?.count?.toLocaleString() || '-'} />
                        <StatRow label="Missing" value={data.data.summary?.missing?.toLocaleString() || '-'} />
                        <div className="h-px bg-slate-50 my-2"></div>
                        <StatRow label="Mean" value={data.data.summary?.mean?.toLocaleString() || '-'} />
                        <StatRow label="Std Dev" value={data.data.summary?.std?.toLocaleString() || '-'} />
                        <div className="h-px bg-slate-50 my-2"></div>
                        <StatRow label="Min" value={data.data.summary?.min?.toLocaleString() || '-'} />
                        <StatRow label="Max" value={data.data.summary?.max?.toLocaleString() || '-'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Heatmap({ xLabels, yLabels, data }: { xLabels: string[], yLabels: string[], data: number[][] }) {
    if (!data || data.length === 0) return null;

    // Helper to get color intensity
    const getColor = (value: number) => {
        const intensity = Math.abs(value);
        if (value > 0) return `rgba(99, 102, 241, ${intensity})`; // Indigo
        return `rgba(239, 68, 68, ${intensity})`; // Red for negative
    };

    return (
        <div className="h-full w-full overflow-auto flex flex-col text-[10px]">
            <div className="flex">
                <div className="w-16 shrink-0"></div> {/* Corner spacer */}
                {xLabels.map((label, i) => (
                    <div key={i} className="w-12 shrink-0 text-center font-bold text-slate-500 truncate px-1" title={label}>
                        {label}
                    </div>
                ))}
            </div>
            {yLabels.map((rowLabel, i) => (
                <div key={i} className="flex">
                    <div className="w-16 shrink-0 font-bold text-slate-500 truncate pr-2 text-right" title={rowLabel}>
                        {rowLabel}
                    </div>
                    {data[i].map((value, j) => (
                        <div 
                            key={j} 
                            className="w-12 h-8 shrink-0 flex items-center justify-center text-slate-700"
                            style={{ backgroundColor: getColor(value) }}
                            title={`${rowLabel} vs ${xLabels[j]}: ${value}`}
                        >
                            {value.toFixed(2)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

function StatRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-bold text-slate-700 font-mono">{value}</span>
        </div>
    )
}
