import { act, renderHook } from '@testing-library/react';
import { useGameStore } from '../../store/gameStore';
import type { Level, TileType } from '../../types/game';

// Mock the GameStateManager
jest.mock('../../game/state/GameStateManager', () => {
  return {
    GameStateManager: jest.fn().mockImplementation(() => ({
      getGameState: jest.fn().mockReturnValue({
        currentLevel: 1,
        currentTurn: 0,
        isTimeTraveling: false,
        activeTurnIndex: 0,
        turnHistory: [],
        score: 0,
        gameStatus: 'playing',
      }),
      reset: jest.fn(),
      advanceTurn: jest.fn(),
      moveCharacter: jest.fn().mockReturnValue(true),
      startTimeReversal: jest.fn(),
      getHexGrid: jest.fn().mockReturnValue({
        getAllCharacters: jest.fn().mockReturnValue([]),
        getAllPizzas: jest.fn().mockReturnValue([]),
        removePizza: jest.fn(),
        distance: jest.fn().mockReturnValue(1),
      }),
    })),
  };
});

describe('Game Store', () => {
  const mockLevel: Level = {
    id: 1,
    name: 'Test Level',
    width: 10,
    height: 10,
    tiles: new Map([
      ['0,0', { position: { q: 0, r: 0, s: 0 }, type: 'grass' as TileType }],
    ]),
    timeLimit: 100,
    isStatic: false,
  };

  beforeEach(() => {
    // Reset store state before each test
    const store = useGameStore.getState();
    store.clearError();
    
    // Reset to initial state
    useGameStore.setState({
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
    });
    
    jest.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.gameState).toBeNull();
    expect(result.current.currentLevel).toBeNull();
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.availableActions).toEqual({
      canMove: false,
      canPickup: false,
      canDrop: false,
      canUseAbility: false,
    });
    expect(result.current.stats).toEqual({
      totalTurns: 0,
      pizzasDelivered: 0,
      timeTravelUses: 0,
      currentScore: 0,
    });
  });

  it('should initialize game correctly', async () => {
    const { result } = renderHook(() => useGameStore());
    
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentLevel).toEqual(mockLevel);
    expect(result.current.gameState).toBeTruthy();
    expect(result.current.availableActions.canMove).toBe(true);
    expect(result.current.availableActions.canPickup).toBe(true);
  });

  it('should handle game initialization errors', async () => {
    const { result } = renderHook(() => useGameStore());
    
    // Mock GameStateManager to throw an error
    const GameStateManager = require('../../game/state/GameStateManager').GameStateManager;
    GameStateManager.mockImplementationOnce(() => {
      throw new Error('Test initialization error');
    });
    
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Test initialization error');
  });

  it('should reset game correctly', async () => {
    const { result } = renderHook(() => useGameStore());
    
    // First initialize the game
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    // Then reset it
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.stats).toEqual({
      totalTurns: 0,
      pizzasDelivered: 0,
      timeTravelUses: 0,
      currentScore: 0,
    });
    expect(result.current.availableActions.canMove).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('should advance turn correctly', async () => {
    const { result } = renderHook(() => useGameStore());
    
    // Initialize game first
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    const initialTurn = result.current.stats.totalTurns;
    
    await act(async () => {
      await result.current.advanceTurn();
    });
    
    expect(result.current.stats.totalTurns).toBe(initialTurn);
  });

  it('should handle character movement', async () => {
    const { result } = renderHook(() => useGameStore());
    
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    const success = await act(async () => {
      return await result.current.moveCharacter('player-1', { q: 1, r: 0, s: -1 });
    });
    
    expect(success).toBe(true);
  });

  it('should handle time abilities', async () => {
    const { result } = renderHook(() => useGameStore());
    
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    const success = await act(async () => {
      return await result.current.useTimeAbility('reverse');
    });
    
    expect(success).toBe(true);
    expect(result.current.stats.timeTravelUses).toBe(1);
  });

  it('should handle pause and resume', async () => {
    const { result } = renderHook(() => useGameStore());
    
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    act(() => {
      result.current.pauseGame();
    });
    
    expect(result.current.availableActions.canMove).toBe(false);
    expect(result.current.availableActions.canPickup).toBe(false);
    
    act(() => {
      result.current.resumeGame();
    });
    
    expect(result.current.availableActions.canMove).toBe(true);
    expect(result.current.availableActions.canPickup).toBe(true);
  });

  it('should handle pizza pickup', async () => {
    const { result } = renderHook(() => useGameStore());
    
    await act(async () => {
      await result.current.initializeGame(mockLevel);
    });
    
    const success = await act(async () => {
      return await result.current.pickupPizza('pizza-1');
    });
    
    // This will return false because there's no player/pizza in the mock
    expect(success).toBe(false);
  });

  it('should handle error clearing', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setError('Test error');
    });
    
    expect(result.current.error).toBe('Test error');
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeUndefined();
  });

  it('should update stats correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.updateStats({ pizzasDelivered: 5, currentScore: 100 });
    });
    
    expect(result.current.stats.pizzasDelivered).toBe(5);
    expect(result.current.stats.currentScore).toBe(100);
    expect(result.current.stats.totalTurns).toBe(0); // Should preserve other stats
  });

  it('should update available actions correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.updateAvailableActions({ canMove: true, canDrop: true });
    });
    
    expect(result.current.availableActions.canMove).toBe(true);
    expect(result.current.availableActions.canDrop).toBe(true);
    expect(result.current.availableActions.canPickup).toBe(false); // Should preserve other actions
  });
});