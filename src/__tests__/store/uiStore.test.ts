import { act, renderHook } from '@testing-library/react';
import { useUIStore } from '../../store/uiStore';
import type { Character } from '../../types/game';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.getState().closeSettings();
    useUIStore.getState().clearMessages();
    useUIStore.getState().selectCharacter(undefined);
    useUIStore.getState().selectHex(undefined);
    useUIStore.getState().hoverHex(undefined);
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.isPaused).toBe(false);
    expect(result.current.showSettings).toBe(false);
    expect(result.current.showHelp).toBe(false);
    expect(result.current.showTimelineDebugger).toBe(false);
    expect(result.current.selectedCharacter).toBeUndefined();
    expect(result.current.selectedHex).toBeUndefined();
    expect(result.current.hoveredHex).toBeUndefined();
    expect(result.current.cutsceneDialogIndex).toBe(0);
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.showGrid).toBe(true);
    expect(result.current.showCoordinates).toBe(false);
    expect(result.current.showMovementRange).toBe(true);
    expect(result.current.animationSpeed).toBe('normal');
  });

  it('should toggle pause correctly', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.togglePause();
    });
    
    expect(result.current.isPaused).toBe(true);
    
    act(() => {
      result.current.togglePause();
    });
    
    expect(result.current.isPaused).toBe(false);
  });

  it('should handle settings modal', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.openSettings();
    });
    
    expect(result.current.showSettings).toBe(true);
    
    act(() => {
      result.current.closeSettings();
    });
    
    expect(result.current.showSettings).toBe(false);
  });

  it('should handle character selection', () => {
    const { result } = renderHook(() => useUIStore());
    
    const character: Character = {
      id: 'test-char',
      position: { q: 0, r: 0, s: 0 },
      name: 'Test Character',
      movementSpeed: 1,
      type: 'player'
    };
    
    act(() => {
      result.current.selectCharacter(character);
    });
    
    expect(result.current.selectedCharacter).toEqual(character);
    
    act(() => {
      result.current.selectCharacter(undefined);
    });
    
    expect(result.current.selectedCharacter).toBeUndefined();
  });

  it('should handle hex selection and hovering', () => {
    const { result } = renderHook(() => useUIStore());
    
    const hex = { q: 1, r: 2, s: -3 };
    
    act(() => {
      result.current.selectHex(hex);
    });
    
    expect(result.current.selectedHex).toEqual(hex);
    
    act(() => {
      result.current.hoverHex(hex);
    });
    
    expect(result.current.hoveredHex).toEqual(hex);
  });

  it('should handle dialog progression', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.advanceDialog();
    });
    
    expect(result.current.cutsceneDialogIndex).toBe(1);
    
    act(() => {
      result.current.advanceDialog();
    });
    
    expect(result.current.cutsceneDialogIndex).toBe(2);
    
    act(() => {
      result.current.resetDialog();
    });
    
    expect(result.current.cutsceneDialogIndex).toBe(0);
  });

  it('should handle error and success messages', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.showError('Test error');
    });
    
    expect(result.current.errorMessage).toBe('Test error');
    expect(result.current.successMessage).toBeUndefined();
    
    act(() => {
      result.current.showSuccess('Test success');
    });
    
    expect(result.current.successMessage).toBe('Test success');
    expect(result.current.errorMessage).toBeUndefined();
    
    act(() => {
      result.current.clearMessages();
    });
    
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.successMessage).toBeUndefined();
  });

  it('should handle UI preferences', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.toggleGrid();
    });
    
    expect(result.current.showGrid).toBe(false);
    
    act(() => {
      result.current.toggleCoordinates();
    });
    
    expect(result.current.showCoordinates).toBe(true);
    
    act(() => {
      result.current.toggleMovementRange();
    });
    
    expect(result.current.showMovementRange).toBe(false);
    
    act(() => {
      result.current.setAnimationSpeed('fast');
    });
    
    expect(result.current.animationSpeed).toBe('fast');
  });
});