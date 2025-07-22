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

12. **MVP Scope**: ✅ RESOLVED - MVP will focus on turn-based gameplay with pizza delivery mechanics on a single procedurally generated level. Time manipulation features will come in Phase 4 after core gameplay is solid.

13. **Testing Strategy**: ✅ PARTIALLY RESOLVED - Using comprehensive unit tests for game logic (120+ tests currently passing). Planning to add integration tests for turn sequences and UI component tests. Debugging tools will be built into UIStore (timeline debugger modal already exists).

14. **Performance Targets**: DECISION NEEDED - Current implementation runs smoothly with 14x12 hex grids. Should we target 20x20 grids as maximum? How many NPCs and pizzas should we support per level?

### Development Process Questions

15. **State Management**: ✅ RESOLVED - Using Zustand for state management with three stores (GameStore, UIStore, TemporalStore) providing clean separation and type safety.

16. **Component Architecture**: ✅ PARTIALLY RESOLVED - Using single HexGridVisualization component for performance, with individual hex tiles rendered as SVG elements. This approach is working well for current implementation.

17. **Testing Standards**: What level of test coverage should we maintain? Should every game mechanic have unit tests, or focus on integration tests for complex interactions?

18. **Code Review Process**: How should multiple coding agents coordinate changes to avoid conflicts? Should there be designated "owners" for different modules?

### ✅ NEW ARCHITECTURAL DECISIONS (Phase 2 Planning)

19. **Turn System Architecture**: ✅ DECIDED - Implementing TurnManager class with phases: Player Phase → NPC Phase → Turn End → New Turn. Will integrate with existing GameStateManager for bitemporal storage.

20. **Movement Point System**: ✅ DECIDED - Starting with 1 movement point per turn per character. Pepperoni pizza adds +1 movement point. System designed for easy extension with other pizza effects.

21. **NPC AI Strategy**: ✅ DECIDED - Simple AI for MVP: NPCs move toward nearest pizza or player using existing A* pathfinding. Deterministic processing order (by ID) for consistent replays.

22. **Animation Framework**: ✅ DECIDED - Smooth character transitions with configurable speed via UIStore. Animations queue for multi-step paths and pause between character turns.

23. **UI Layout Design**: ✅ DECIDED - Game grid as main content with HUD overlay. Control panel on right side, status messages in top-right. All UI components use Zustand stores exclusively.

### 🔄 QUESTIONS FOR NEXT PHASE IMPLEMENTATION

24. **Turn Transition Timing**: Should there be a brief pause between player ending turn and NPCs starting to move? This could help players track what's happening.

25. **Pizza Delivery Validation**: How should we validate pizza deliveries? Should NPCs have specific pizza requests, or accept any pizza?

26. **Level Win Condition**: Is the win condition "deliver all pizzas" or "deliver X number of pizzas within time limit"? This affects game balance.

27. **Error Handling Strategy**: How should we handle edge cases like NPCs getting stuck, invalid moves, or animation failures? Should the game pause or continue?

28. **Development Coordination**: Should Tasks 4, 5, and 12 be worked on sequentially or in parallel by different coding agents? What are the integration points?
