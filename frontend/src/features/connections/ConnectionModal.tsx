import { useState } from 'react';
import { X, Database, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ConnectionModal({ isOpen, onClose, onSuccess }: ConnectionModalProps) {
    const [formData, setFormData] = useState({
        type: 'mysql',
        name: '',
        host: 'localhost',
        port: '3306',
        username: '',
        password: '',
        database: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8000/api/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.type,
                    name: formData.name,
                    config: {
                        host: formData.host,
                        port: parseInt(formData.port),
                        database: formData.database,
                        username: formData.username
                    },
                    secret: {
                        password: formData.password
                    }
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Connection failed');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-[480px] border border-slate-100 animate-in zoom-in-95 duration-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-blue-600" />
                        New Connection
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Database Type */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                            { id: 'mysql', label: 'MySQL', port: '3306' },
                            { id: 'postgres', label: 'PostgreSQL', port: '5432' },
                            { id: 'clickhouse', label: 'ClickHouse', port: '8123' },
                            { id: 'hive', label: 'Hive', port: '10000' },
                            { id: 'duckdb', label: 'DuckDB', port: '' },
                            { id: 'sqlite', label: 'SQLite', port: '' },
                            { id: 'oracle', label: 'Oracle', port: '1521' },
                            { id: 'mssql', label: 'SQL Server', port: '1433' }
                        ].map(db => (
                            <div
                                key={db.id}
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        type: db.id,
                                        port: db.port,
                                        host: (db.id === 'sqlite' || db.id === 'duckdb') ? '' : 'localhost'
                                    });
                                }}
                                className={cn(
                                    "cursor-pointer border rounded-lg p-2 text-center text-xs font-bold uppercase transition-all truncate",
                                    formData.type === db.id
                                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                        : "border-slate-200 text-slate-500 hover:border-blue-300"
                                )}
                                title={db.label}
                            >
                                {db.label}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Display Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="e.g. Production DB"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Host/Port - Hide for File-based DBs */}
                        {!['sqlite', 'duckdb'].includes(formData.type) && (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Host</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                        placeholder="localhost"
                                        value={formData.host}
                                        onChange={e => setFormData({ ...formData, host: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Port</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                        value={formData.port}
                                        onChange={e => setFormData({ ...formData, port: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* File Path for SQLite/DuckDB */}
                        {['sqlite', 'duckdb'].includes(formData.type) && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">File Path</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    placeholder="/path/to/database"
                                    value={formData.database}
                                    onChange={e => setFormData({ ...formData, database: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Optional Database Name for Server DBs */}
                        {!['sqlite', 'duckdb'].includes(formData.type) && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between">
                                    <span>Database Name</span>
                                    <span className="text-slate-300 font-normal italic">Optional (Scan all)</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    placeholder="Leave empty to list all"
                                    value={formData.database}
                                    onChange={e => setFormData({ ...formData, database: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center">
                            <X className="w-3 h-3 mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            Connect
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
