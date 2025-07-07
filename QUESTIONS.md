## Open Questions

### ✅ RESOLVED: Architecture Alignment Issues

**COMPLETED**: The code structure now matches the planned architecture in PROJECT_STRUCTURE.md:

1. **Directory Structure**: All required directories (`src/game/`, `src/components/`, `src/hooks/`, `src/store/`) are created and properly organized.

2. **State Management**: Zustand-based state management system is implemented with GameStore, UIStore, and TemporalStore.

3. **Separation of Concerns**: Game logic is properly separated from UI components using the store layer.

**Status**: Tasks 18 and 19 are completed. Architecture foundation is solid for future development.

### Technical Architecture Questions

1. **Bitemporal State Complexity**: How do we handle the memory requirements of storing complete game state at every turn, especially for long gameplay sessions? Should we implement state compression or periodic cleanup?

2. **Time Reversal Edge Cases**: When using Sausage Pizza (time reversal), how do we handle interactions between the "live" player and NPCs moving backwards? What happens if the player tries to pick up a pizza that their past self already collected?

3. **Ghost Rendering Performance**: When replaying levels with multiple timelines, how do we efficiently render multiple "ghost" versions of characters without performance issues?

4. **Save/Load System**: How should we handle saving and loading games that have complex temporal states? What's the minimum data needed to reconstruct any timeline?

### Game Design Questions

5. **Timer Mechanics**: Should the timer pause during time manipulation abilities, or continue running? This affects the strategic depth of time-based pizza usage.

6. **Pizza Spawn Rules**: ✅ PARTIALLY RESOLVED - Current implementation uses deterministic spawn locations for reproducible gameplay. Random generation uses seeded algorithms to ensure consistency across game sessions.

7. **NPC Behavior**: How intelligent should NPCs be? Should they have predictable movement patterns or more complex AI that could create interesting temporal puzzles?

8. **Difficulty Progression**: How should the 30 levels increase in difficulty? Should it be grid size, number of NPCs, timer pressure, or introduce new mechanics?

### User Experience Questions

9. **Time Manipulation Tutorial**: How do we teach players the complex time manipulation mechanics without overwhelming them?

10. **Visual Feedback**: What visual cues should we use to indicate different temporal states (normal time, reversed time, ghost actions, etc.)?

11. **Accessibility**: How do we make the hex-based movement and complex temporal mechanics accessible to players with different abilities?

### Implementation Priority Questions

12. **MVP Scope**: What's the minimum viable product that demonstrates the core time manipulation mechanics? Should we focus on a single level prototype first?

13. **Testing Strategy**: How do we test complex temporal interactions? Should we build debugging tools to visualize timeline states?

14. **Performance Targets**: What are our performance requirements for the web version? How complex can levels be before we hit performance issues?

### Development Process Questions

15. **State Management**: ✅ RESOLVED - Using Zustand for state management with three stores (GameStore, UIStore, TemporalStore) providing clean separation and type safety.

16. **Component Architecture**: ✅ PARTIALLY RESOLVED - Using single HexGridVisualization component for performance, with individual hex tiles rendered as SVG elements. This approach is working well for current implementation.

17. **Testing Standards**: What level of test coverage should we maintain? Should every game mechanic have unit tests, or focus on integration tests for complex interactions?

18. **Code Review Process**: How should multiple coding agents coordinate changes to avoid conflicts? Should there be designated "owners" for different modules?
