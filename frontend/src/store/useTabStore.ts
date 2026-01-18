import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type TabType = 'GRID' | 'SQL' | 'CHART' | 'REPORT';

export interface Tab {
    id: string;
    type: TabType;
    title: string;
    data?: any; // e.g., dataset ID, query result
}

interface TabState {
    tabs: Tab[];
    activeTabId: string | null;

    addTab: (tab: Omit<Tab, 'id'>) => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
    tabs: [
        { id: '1', type: 'GRID', title: 'loan_data_v2', data: { datasetId: 'loan_data_v2' } }
    ],
    activeTabId: '1',

    addTab: (tab) => {
        const id = uuidv4();
        set((state) => ({
            tabs: [...state.tabs, { ...tab, id }],
            activeTabId: id,
        }));
    },

    closeTab: (id) => set((state) => {
        const newTabs = state.tabs.filter((t) => t.id !== id);
        let newActiveId = state.activeTabId;

        // If closing active tab, switch to the last one
        if (state.activeTabId === id) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
        }

        return { tabs: newTabs, activeTabId: newActiveId };
    }),

    setActiveTab: (id) => set({ activeTabId: id }),
}));
