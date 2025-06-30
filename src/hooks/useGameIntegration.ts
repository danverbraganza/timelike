import { useEffect, useCallback } from 'react';
import { useGameStore, useUIStore, useTemporalStore } from '../store';
import type { Level, HexCoordinate } from '../types/game';

/**
 * Hook that provides integrated game functionality
 * Combines game state management with UI feedback
 */
export const useGameIntegration = () => {
  const gameStore = useGameStore();
  const uiStore = useUIStore();
  const temporalStore = useTemporalStore();

  // Initialize game with proper error handling and UI feedback
  const initializeGame = useCallback(async (level: Level) => {
    try {
      uiStore.clearMessages();
      await gameStore.initializeGame(level);
      uiStore.showSuccess('Game initialized successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize game';
      uiStore.showError(message);
    }
  }, [gameStore, uiStore]);

  // Move character with UI feedback
  const moveCharacter = useCallback(async (characterId: string, position: HexCoordinate) => {
    try {
      const success = await gameStore.moveCharacter(characterId, position);
      if (!success) {
        uiStore.showError('Cannot move to that position');
      }
      return success;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Move failed';
      uiStore.showError(message);
      return false;
    }
  }, [gameStore, uiStore]);

  // Advance turn with timeline updates
  const advanceTurn = useCallback(async () => {
    try {
      await gameStore.advanceTurn();
      
      // Update temporal store with new timeline data
      // This would get actual timeline data from the game state manager
      if (gameStore.gameState?.bitemporalState) {
        const timelines = Array.from(gameStore.gameState.bitemporalState.timelines.values())
          .map(timeline => ({
            id: timeline.id,
            isActive: timeline.id === gameStore.gameState?.bitemporalState?.activeTimelineId,
            branchPoint: timeline.branchPoint,
          }));
        
        temporalStore.updateTimelines(timelines);
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to advance turn';
      uiStore.showError(message);
    }
  }, [gameStore, uiStore, temporalStore]);

  // Use time ability with UI feedback and temporal state updates
  const useTimeAbility = useCallback(async (abilityType: 'reverse' | 'restart' | 'speedup') => {
    try {
      const success = await gameStore.useTimeAbility(abilityType);
      
      if (success) {
        uiStore.showSuccess(`${abilityType} ability activated!`);
        
        // Update temporal abilities
        temporalStore.updateTimeAbilities({
          // These would be calculated based on current game state
          canReverse: abilityType !== 'reverse', // Can't reverse if just reversed
          canRestart: true,
          canSpeedUp: true,
          reverseTurnsRemaining: abilityType === 'reverse' ? 5 : temporalStore.availableTimeAbilities.reverseTurnsRemaining,
        });
      } else {
        uiStore.showError(`Cannot use ${abilityType} ability right now`);
      }
      
      return success;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to use ${abilityType} ability`;
      uiStore.showError(message);
      return false;
    }
  }, [gameStore, uiStore, temporalStore]);

  // Game control functions
  const pauseGame = useCallback(() => {
    gameStore.pauseGame();
    uiStore.togglePause();
  }, [gameStore, uiStore]);

  const resumeGame = useCallback(() => {
    gameStore.resumeGame();
    uiStore.togglePause();
  }, [gameStore, uiStore]);

  // Sync game errors with UI
  useEffect(() => {
    if (gameStore.error) {
      uiStore.showError(gameStore.error);
      gameStore.clearError();
    }
  }, [gameStore.error, uiStore, gameStore]);

  return {
    // Game state
    gameState: gameStore.gameState,
    currentLevel: gameStore.currentLevel,
    isInitialized: gameStore.isInitialized,
    isLoading: gameStore.isLoading,
    availableActions: gameStore.availableActions,
    stats: gameStore.stats,
    
    // UI state
    isPaused: uiStore.isPaused,
    selectedCharacter: uiStore.selectedCharacter,
    selectedHex: uiStore.selectedHex,
    hoveredHex: uiStore.hoveredHex,
    
    // Temporal state
    isTimeViewActive: temporalStore.isTimeViewActive,
    availableTimelines: temporalStore.availableTimelines,
    availableTimeAbilities: temporalStore.availableTimeAbilities,
    
    // Actions
    initializeGame,
    moveCharacter,
    advanceTurn,
    useTimeAbility,
    pauseGame,
    resumeGame,
    
    // UI actions
    selectCharacter: uiStore.selectCharacter,
    selectHex: uiStore.selectHex,
    hoverHex: uiStore.hoverHex,
    
    // Temporal actions
    enterTimeView: temporalStore.enterTimeView,
    exitTimeView: temporalStore.exitTimeView,
    viewTurn: temporalStore.viewTurn,
  };
};