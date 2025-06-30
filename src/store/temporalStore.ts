import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TemporalStore } from './types';

/**
 * Temporal Store manages time travel and timeline visualization state
 * This handles the UI aspects of the bitemporal system
 */
export const useTemporalStore = create<TemporalStore>()(
  devtools(
    (set, get) => ({
      // Initial temporal state
      isTimeViewActive: false,
      viewingTurn: 0,
      availableTimelines: [],
      availableTimeAbilities: {
        canReverse: false,
        canRestart: false,
        canSpeedUp: false,
        reverseTurnsRemaining: 0,
      },
      showGhosts: true,
      ghostTimelines: [],

      // Time view actions
      enterTimeView: () => {
        set({ isTimeViewActive: true });
      },
      
      exitTimeView: () => {
        set({ isTimeViewActive: false });
      },
      
      viewTurn: (turnNumber) => {
        const state = get();
        if (state.isTimeViewActive) {
          set({ viewingTurn: Math.max(0, turnNumber) });
        }
      },

      // Timeline actions
      updateTimelines: (timelines) => {
        const formattedTimelines = timelines.map((timeline, index) => ({
          id: timeline.id,
          name: timeline.isActive ? 'Active Timeline' : `Timeline ${index + 1}`,
          branchPoint: timeline.branchPoint,
          isActive: timeline.isActive,
        }));
        
        set({ availableTimelines: formattedTimelines });
      },

      // Ability actions
      updateTimeAbilities: (abilities) => {
        set((state) => ({
          availableTimeAbilities: {
            ...state.availableTimeAbilities,
            ...abilities,
          },
        }));
      },

      // Ghost actions
      toggleGhosts: () => {
        set((state) => ({ showGhosts: !state.showGhosts }));
      },
      
      setGhostTimelines: (timelineIds) => {
        set({ ghostTimelines: timelineIds });
      },
    }),
    {
      name: 'temporal-store',
      partialize: (state: TemporalStore) => ({
        // Persist ghost visualization preferences
        showGhosts: state.showGhosts,
      }),
    }
  )
);