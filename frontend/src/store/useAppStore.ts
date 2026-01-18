import { create } from 'zustand';

interface AppState {
    leftOpen: boolean;
    rightOpen: boolean;
    bottomOpen: boolean;

    toggleLeft: () => void;
    toggleRight: () => void;
    toggleBottom: () => void;

    setLeft: (open: boolean) => void;
    setRight: (open: boolean) => void;
    setBottom: (open: boolean) => void;

    // Resizing State
    leftWidth: number;
    rightWidth: number;
    bottomHeight: number;
    setLeftWidth: (width: number) => void;
    setRightWidth: (width: number) => void;
    setBottomHeight: (height: number) => void;

    isFullScreen: boolean;
    toggleFullScreen: () => void;
    // Private state to restore previous layout
    savedState: { left: boolean; right: boolean; bottom: boolean } | null;
}

export const useAppStore = create<AppState>((set) => ({
    leftOpen: true,
    rightOpen: true,
    bottomOpen: true,

    leftWidth: 200,
    rightWidth: 200,
    bottomHeight: 120,

    setLeftWidth: (width) => set({ leftWidth: width }),
    setRightWidth: (width) => set({ rightWidth: width }),
    setBottomHeight: (height) => set({ bottomHeight: height }),

    isFullScreen: false,
    savedState: null,

    toggleLeft: () => set((state) => ({ leftOpen: !state.leftOpen })),
    toggleRight: () => set((state) => ({ rightOpen: !state.rightOpen })),
    toggleBottom: () => set((state) => ({ bottomOpen: !state.bottomOpen })),

    setLeft: (open) => set({ leftOpen: open }),
    setRight: (open) => set({ rightOpen: open }),
    setBottom: (open) => set({ bottomOpen: open }),

    toggleFullScreen: () => set((state) => {
        if (state.isFullScreen) {
            // Restore
            const saved = state.savedState || { left: true, right: true, bottom: true };
            return {
                isFullScreen: false,
                leftOpen: saved.left,
                rightOpen: saved.right,
                bottomOpen: saved.bottom,
                savedState: null
            };
        } else {
            // Go Full Screen (Save current state)
            return {
                isFullScreen: true,
                savedState: { left: state.leftOpen, right: state.rightOpen, bottom: state.bottomOpen },
                leftOpen: false,
                rightOpen: false,
                bottomOpen: false
            };
        }
    }),
}));

