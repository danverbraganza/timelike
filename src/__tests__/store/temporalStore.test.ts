import { act, renderHook } from '@testing-library/react';
import { useTemporalStore } from '../../store/temporalStore';

describe('Temporal Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTemporalStore.getState().exitTimeView();
    useTemporalStore.getState().updateTimelines([]);
    useTemporalStore.getState().updateTimeAbilities({
      canReverse: false,
      canRestart: false,
      canSpeedUp: false,
      reverseTurnsRemaining: 0,
    });
    useTemporalStore.getState().setGhostTimelines([]);
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    expect(result.current.isTimeViewActive).toBe(false);
    expect(result.current.viewingTurn).toBe(0);
    expect(result.current.availableTimelines).toEqual([]);
    expect(result.current.availableTimeAbilities).toEqual({
      canReverse: false,
      canRestart: false,
      canSpeedUp: false,
      reverseTurnsRemaining: 0,
    });
    expect(result.current.showGhosts).toBe(true);
    expect(result.current.ghostTimelines).toEqual([]);
  });

  it('should handle time view activation', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    act(() => {
      result.current.enterTimeView();
    });
    
    expect(result.current.isTimeViewActive).toBe(true);
    
    act(() => {
      result.current.exitTimeView();
    });
    
    expect(result.current.isTimeViewActive).toBe(false);
  });

  it('should handle turn viewing when time view is active', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    act(() => {
      result.current.enterTimeView();
    });
    
    act(() => {
      result.current.viewTurn(5);
    });
    
    expect(result.current.viewingTurn).toBe(5);
    
    // Should not allow negative turns
    act(() => {
      result.current.viewTurn(-1);
    });
    
    expect(result.current.viewingTurn).toBe(0);
  });

  it('should not change viewing turn when time view is inactive', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    // Time view is inactive by default
    act(() => {
      result.current.viewTurn(5);
    });
    
    expect(result.current.viewingTurn).toBe(0);
  });

  it('should handle timeline updates', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    const timelines = [
      { id: 'timeline-1', isActive: true, branchPoint: undefined },
      { id: 'timeline-2', isActive: false, branchPoint: 5 },
    ];
    
    act(() => {
      result.current.updateTimelines(timelines);
    });
    
    expect(result.current.availableTimelines).toEqual([
      { id: 'timeline-1', name: 'Active Timeline', isActive: true, branchPoint: undefined },
      { id: 'timeline-2', name: 'Timeline 2', isActive: false, branchPoint: 5 },
    ]);
  });

  it('should handle time ability updates', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    act(() => {
      result.current.updateTimeAbilities({
        canReverse: true,
        reverseTurnsRemaining: 3,
      });
    });
    
    expect(result.current.availableTimeAbilities).toEqual({
      canReverse: true,
      canRestart: false,
      canSpeedUp: false,
      reverseTurnsRemaining: 3,
    });
    
    // Should merge with existing state
    act(() => {
      result.current.updateTimeAbilities({
        canRestart: true,
      });
    });
    
    expect(result.current.availableTimeAbilities).toEqual({
      canReverse: true,
      canRestart: true,
      canSpeedUp: false,
      reverseTurnsRemaining: 3,
    });
  });

  it('should handle ghost visualization', () => {
    const { result } = renderHook(() => useTemporalStore());
    
    act(() => {
      result.current.toggleGhosts();
    });
    
    expect(result.current.showGhosts).toBe(false);
    
    act(() => {
      result.current.toggleGhosts();
    });
    
    expect(result.current.showGhosts).toBe(true);
    
    act(() => {
      result.current.setGhostTimelines(['timeline-1', 'timeline-2']);
    });
    
    expect(result.current.ghostTimelines).toEqual(['timeline-1', 'timeline-2']);
  });
});