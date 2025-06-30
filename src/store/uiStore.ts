import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UIStore } from './types';

/**
 * UI Store manages all user interface state
 * This includes modals, selections, preferences, and feedback messages
 */
export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial UI state
      isPaused: false,
      showSettings: false,
      showHelp: false,
      showTimelineDebugger: false,
      selectedCharacter: undefined,
      selectedHex: undefined,
      hoveredHex: undefined,
      cutsceneDialogIndex: 0,
      errorMessage: undefined,
      successMessage: undefined,
      showGrid: true,
      showCoordinates: false,
      showMovementRange: true,
      animationSpeed: 'normal',

      // Modal actions
      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
      
      openSettings: () => set({ showSettings: true }),
      
      closeSettings: () => set({ showSettings: false }),
      
      toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
      
      toggleTimelineDebugger: () => set((state) => ({ 
        showTimelineDebugger: !state.showTimelineDebugger 
      })),

      // Selection actions
      selectCharacter: (character) => set({ selectedCharacter: character }),
      
      selectHex: (hex) => set({ selectedHex: hex }),
      
      hoverHex: (hex) => set({ hoveredHex: hex }),

      // Cutscene actions
      advanceDialog: () => set((state) => ({ 
        cutsceneDialogIndex: state.cutsceneDialogIndex + 1 
      })),
      
      resetDialog: () => set({ cutsceneDialogIndex: 0 }),

      // Feedback actions
      showError: (message) => {
        set({ errorMessage: message, successMessage: undefined });
        // Auto-clear after 5 seconds
        setTimeout(() => {
          const currentError = get().errorMessage;
          if (currentError === message) {
            set({ errorMessage: undefined });
          }
        }, 5000);
      },
      
      showSuccess: (message) => {
        set({ successMessage: message, errorMessage: undefined });
        // Auto-clear after 3 seconds
        setTimeout(() => {
          const currentSuccess = get().successMessage;
          if (currentSuccess === message) {
            set({ successMessage: undefined });
          }
        }, 3000);
      },
      
      clearMessages: () => set({ errorMessage: undefined, successMessage: undefined }),

      // Preference actions
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      
      toggleCoordinates: () => set((state) => ({ showCoordinates: !state.showCoordinates })),
      
      toggleMovementRange: () => set((state) => ({ showMovementRange: !state.showMovementRange })),
      
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
    }),
    {
      name: 'ui-store',
      partialize: (state: UIStore) => ({
        // Persist only user preferences
        showGrid: state.showGrid,
        showCoordinates: state.showCoordinates,
        showMovementRange: state.showMovementRange,
        animationSpeed: state.animationSpeed,
      }),
    }
  )
);