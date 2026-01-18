import { create } from 'zustand';

export interface SessionTable {
    id: string;
    name: string;
    rowCount: number;
    createdAt: Date;
    type: 'table' | 'view';
}

interface SessionState {
    tables: SessionTable[];
    addTable: (table: SessionTable) => void;
    clearTables: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    tables: [
        // Pre-populate one for demo
        { id: 'result_init', name: 'analysis_result_v1', rowCount: 1500, createdAt: new Date(), type: 'table' }
    ],
    addTable: (table) => set((state) => ({ tables: [table, ...state.tables] })),
    clearTables: () => set({ tables: [] }),
}));
