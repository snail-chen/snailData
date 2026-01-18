import { create } from 'zustand';

// View Context
export type ViewType = 'dashboard' | 'data' | 'sql' | 'model' | 'stats';

interface ViewState {
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
    activeDatasetId: string | null; // Currently selected dataset
    setActiveDatasetId: (id: string | null) => void;

    activeAnalysisType: 'distribution' | 'missing' | 'outlier' | 'dupes';
    setActiveAnalysisType: (type: 'distribution' | 'missing' | 'outlier' | 'dupes') => void;
}

export const useViewStore = create<ViewState>((set) => ({
    activeView: 'dashboard',
    setActiveView: (view) => set({ activeView: view }),
    activeDatasetId: 'loan_data_v2', // Default mock
    setActiveDatasetId: (id) => set({ activeDatasetId: id }),
    activeAnalysisType: 'distribution',
    setActiveAnalysisType: (type) => set({ activeAnalysisType: type }),
}));
