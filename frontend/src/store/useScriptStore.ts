import { create } from 'zustand';

export interface Script {
    id: string;
    name: string;
    language: 'sql' | 'python';
    content: string;
    createdAt: Date;
}

interface ScriptState {
    scripts: Script[];
    activeScriptId: string | null;
    activeLanguage: 'sql' | 'python'; // track active script language
    addScript: (lang: 'sql' | 'python') => void;
    updateScript: (id: string, content: string) => void;
    setActiveScript: (id: string) => void;
    deleteScript: (id: string) => void;
}

export const useScriptStore = create<ScriptState>((set) => ({
    scripts: [
        {
            id: '1',
            name: 'analysis_v1.sql',
            language: 'sql',
            content: "SELECT * FROM loan_data_v2 WHERE grade = 'A' LIMIT 100;",
            createdAt: new Date()
        }
    ],
    activeScriptId: '1',
    activeLanguage: 'sql',

    addScript: (lang) => set((state) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const ext = lang === 'sql' ? 'sql' : 'py';
        const newScript: Script = {
            id: newId,
            name: `script_${new Date().getTime().toString().substr(-6)}.${ext}`,
            language: lang,
            content: lang === 'sql'
                ? '-- New Query\nSELECT * FROM loan_data_v2 LIMIT 10;'
                : '# New Script\nimport pandas as pd\n\nprint("Hello from Python")',
            createdAt: new Date()
        };
        return { scripts: [...state.scripts, newScript], activeScriptId: newId, activeLanguage: lang };
    }),

    updateScript: (id, content) => set((state) => ({
        scripts: state.scripts.map(s => s.id === id ? { ...s, content } : s)
    })),

    setActiveScript: (id) => set({ activeScriptId: id }),

    deleteScript: (id) => set((state) => ({
        scripts: state.scripts.filter(s => s.id !== id),
        activeScriptId: state.activeScriptId === id ? (state.scripts[0]?.id || null) : state.activeScriptId
    }))
}));
