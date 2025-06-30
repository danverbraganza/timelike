import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GameStateManager } from '../game/state/GameStateManager';
import { hexDistance } from '../utils/hex';
import type { GameStore } from './types';
import type { Level, HexCoordinate } from '../types/game';

/**
 * Game Store manages the core game state and provides actions for game interactions
 * This bridges the UI with the underlying GameStateManager
 */
export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => {
      let gameStateManager: GameStateManager | null = null;

      return {
        // Initial game state
        gameState: null,
        currentLevel: null,
        isInitialized: false,
        isLoading: false,
        error: undefined,
        availableActions: {
          canMove: false,
          canPickup: false,
          canDrop: false,
          canUseAbility: false,
        },
        stats: {
          totalTurns: 0,
          pizzasDelivered: 0,
          timeTravelUses: 0,
          currentScore: 0,
        },

        // Initialization
        initializeGame: async (level: Level) => {
          set({ isLoading: true, error: undefined });
          
          try {
            // Create new game state manager
            gameStateManager = new GameStateManager(level);
            
            const gameState = gameStateManager.getGameState();
            
            set({
              gameState,
              currentLevel: level,
              isInitialized: true,
              isLoading: false,
              stats: {
                totalTurns: gameState.currentTurn,
                pizzasDelivered: 0,
                timeTravelUses: 0,
                currentScore: gameState.score,
              },
            });

            // Update available actions based on initial state
            get().updateAvailableActions({
              canMove: gameState.gameStatus === 'playing',
              canPickup: gameState.gameStatus === 'playing',
              canDrop: false, // No pizza initially
              canUseAbility: false, // No abilities initially
            });
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize game';
            set({ 
              error: errorMessage, 
              isLoading: false,
              isInitialized: false 
            });
          }
        },

        resetGame: () => {
          if (gameStateManager) {
            gameStateManager.reset();
            const gameState = gameStateManager.getGameState();
            
            set({
              gameState,
              stats: {
                totalTurns: 0,
                pizzasDelivered: 0,
                timeTravelUses: 0,
                currentScore: 0,
              },
              availableActions: {
                canMove: true,
                canPickup: true,
                canDrop: false,
                canUseAbility: false,
              },
              error: undefined,
            });
          }
        },

        // Game flow
        advanceTurn: async () => {
          if (!gameStateManager) {
            throw new Error('Game not initialized');
          }

          try {
            gameStateManager.advanceTurn();
            const gameState = gameStateManager.getGameState();
            
            set({
              gameState,
              stats: {
                ...get().stats,
                totalTurns: gameState.currentTurn,
                currentScore: gameState.score,
              },
            });

            // Update available actions based on game state
            get().updateAvailableActions({
              canMove: gameState.gameStatus === 'playing',
              canPickup: gameState.gameStatus === 'playing',
              canUseAbility: gameState.gameStatus === 'playing',
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to advance turn';
            set({ error: errorMessage });
          }
        },

        pauseGame: () => {
          // Update available actions to disable game actions
          set({
            availableActions: {
              canMove: false,
              canPickup: false,
              canDrop: false,
              canUseAbility: false,
            },
          });
        },

        resumeGame: () => {
          const { gameState } = get();
          if (gameState?.gameStatus === 'playing') {
            set({
              availableActions: {
                canMove: true,
                canPickup: true,
                canDrop: !!gameStateManager?.getHexGrid().getAllPizzas().length,
                canUseAbility: true,
              },
            });
          }
        },

        // Game actions
        moveCharacter: async (characterId: string, newPosition: HexCoordinate) => {
          if (!gameStateManager) {
            throw new Error('Game not initialized');
          }

          try {
            const success = gameStateManager.moveCharacter(characterId, newPosition);
            
            if (success) {
              const gameState = gameStateManager.getGameState();
              set({ gameState });
            }
            
            return success;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to move character';
            set({ error: errorMessage });
            return false;
          }
        },

        pickupPizza: async (pizzaId: string) => {
          if (!gameStateManager) {
            throw new Error('Game not initialized');
          }

          try {
            // Get player position
            const hexGrid = gameStateManager.getHexGrid();
            const player = hexGrid.getAllCharacters().find(c => c.type === 'player');
            const pizza = hexGrid.getAllPizzas().find(p => p.id === pizzaId);
            
            if (!player || !pizza) {
              return false;
            }

            // Check if player is adjacent to pizza
            const playerPos = player.position;
            const pizzaPos = pizza.position;
            const distance = hexDistance(playerPos, pizzaPos);
            
            if (distance <= 1) {
              // Remove pizza from grid (simulate pickup)
              hexGrid.removePizza(pizzaId);
              
              const gameState = gameStateManager.getGameState();
              set({ 
                gameState,
                availableActions: {
                  ...get().availableActions,
                  canDrop: true,
                },
              });
              
              return true;
            }
            
            return false;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to pickup pizza';
            set({ error: errorMessage });
            return false;
          }
        },

        dropPizza: async () => {
          if (!gameStateManager) {
            throw new Error('Game not initialized');
          }

          try {
            // This would be implemented when inventory system is added
            // For now, just update available actions
            set({
              availableActions: {
                ...get().availableActions,
                canDrop: false,
              },
            });
            
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to drop pizza';
            set({ error: errorMessage });
            return false;
          }
        },

        deliverPizza: async (targetId: string) => {
          if (!gameStateManager) {
            throw new Error('Game not initialized');
          }

          try {
            // This would check if player has correct pizza for target
            // and deliver it if conditions are met
            // TODO: Implement actual pizza delivery logic using targetId
            console.log('Delivering pizza to target:', targetId);
            const stats = get().stats;
            set({
              stats: {
                ...stats,
                pizzasDelivered: stats.pizzasDelivered + 1,
              },
              availableActions: {
                ...get().availableActions,
                canDrop: false,
              },
            });
            
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to deliver pizza';
            set({ error: errorMessage });
            return false;
          }
        },

        // Time manipulation
        useTimeAbility: async (abilityType: 'reverse' | 'restart' | 'speedup') => {
          if (!gameStateManager) {
            throw new Error('Game not initialized');
          }

          try {
            let success = false;
            
            switch (abilityType) {
              case 'reverse':
                gameStateManager.startTimeReversal();
                success = true;
                break;
              case 'restart':
                gameStateManager.reset();
                success = true;
                break;
              case 'speedup':
                // This would be implemented when speed boost is added
                success = true;
                break;
            }

            if (success) {
              const gameState = gameStateManager.getGameState();
              const stats = get().stats;
              
              set({
                gameState,
                stats: {
                  ...stats,
                  timeTravelUses: stats.timeTravelUses + 1,
                },
              });
            }
            
            return success;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to use ${abilityType} ability`;
            set({ error: errorMessage });
            return false;
          }
        },

        // State updates
        updateGameState: (gameState) => {
          set({ gameState });
        },

        updateStats: (stats) => {
          set((state) => ({
            stats: { ...state.stats, ...stats },
          }));
        },

        updateAvailableActions: (actions) => {
          set((state) => ({
            availableActions: { ...state.availableActions, ...actions },
          }));
        },

        // Error handling
        setError: (error) => {
          set({ error });
        },

        clearError: () => {
          set({ error: undefined });
        },
      };
    },
    {
      name: 'game-store',
    }
  )
);