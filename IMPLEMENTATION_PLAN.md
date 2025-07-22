# Timelike Implementation Plan - Phase 2

## Executive Summary

This plan outlines the next critical development phase for Timelike, focusing on implementing core turn-based gameplay mechanics. The project has a solid foundation with 120 passing tests, working visualization, and clean architecture. Phase 2 will implement the game loop that unlocks all subsequent gameplay features.

## Current Project Status

### ✅ Completed Foundation (Phase 1)
- **Architecture**: Clean separation with `src/game/`, `src/components/`, `src/hooks/`, `src/store/`
- **State Management**: Zustand stores (GameStore, UIStore, TemporalStore) with full integration
- **Hexagonal Grid**: Complete with A* pathfinding, multiple tile types, collision detection
- **Bitemporal State**: GameStateManager with timeline storage and time manipulation framework
- **Visualization**: Interactive 2D/isometric hex grid with click-to-move functionality
- **Level Generation**: Procedural generation with multiple algorithms (Perlin, Cellular, Simple, Hybrid)
- **Testing**: 120 tests passing, comprehensive coverage of game logic and stores

### 🎯 Phase 2 Objectives
Implement turn-based game loop, enhanced movement system, and comprehensive game UI to create a playable pizza delivery game.

## Implementation Strategy

### Priority 1: Turn-Based Game Loop (Task 4) - CRITICAL
**Timeline**: Week 1
**Coding Agent**: Primary focus, blocks other gameplay features

#### Key Components:
1. **TurnManager Class** (`src/game/TurnManager.ts`)
   - Phase management: Player → NPC → Turn End → New Turn
   - Turn counter and active character tracking
   - Integration with GameStateManager for state persistence

2. **Simple AI System** (`src/game/ai/SimpleAI.ts`)
   - NPCs move toward nearest pizza or player
   - Deterministic processing order for consistent replays
   - Respect terrain and collision rules

3. **GameStore Integration**
   - Add turn management actions
   - Event system for phase transitions
   - Turn state synchronization with UI

#### Success Criteria:
- Player takes action → NPCs move → Turn advances
- All actions logged in bitemporal store
- UI reflects current turn/phase
- 15+ comprehensive unit tests

### Priority 2: Game UI Components (Task 12) - HIGH
**Timeline**: Week 1 (parallel with Task 4)
**Coding Agent**: Can develop independently

#### Key Components:
1. **GameHUD** - Turn counter, timer, movement points, pizza inventory
2. **GameControls** - End turn, pause, settings, restart, view toggle
3. **CharacterInfo** - Selected character stats and abilities
4. **LevelInfo** - Objectives, score, level status
5. **StatusMessage** - Enhanced feedback system

#### Integration Points:
- All components use Zustand stores exclusively
- No direct game logic in UI components
- Real-time updates via store subscriptions

### Priority 3: Enhanced Movement System (Task 5) - HIGH
**Timeline**: Week 2 (after Task 4 completion)
**Coding Agent**: Builds on turn system foundation

#### Key Components:
1. **MovementSystem** - Turn-based movement validation and execution
2. **PathPreview** - Visual movement range and path display
3. **Animation System** - Smooth character transitions
4. **Pizza Effects** - Movement point modifiers

## Development Coordination

### Parallel Development Strategy:
```
Week 1:
├── Agent 1: Task 4 (Turn System) [CRITICAL - must finish first]
└── Agent 2: Task 12 (UI Components) [HIGH - independent development]

Week 2:
├── Agent 1: Task 5 (Movement System) [HIGH - requires Task 4]
└── Agent 2: Integration testing and bug fixes
```

### Integration Checkpoints:
1. **Day 3**: Task 4 basic turn loop working
2. **Day 5**: Task 12 UI components integrated with stores
3. **Day 7**: Tasks 4 & 12 fully integrated and tested
4. **Day 10**: Task 5 movement system complete
5. **Day 14**: Full Phase 2 integration and testing

## Technical Requirements

### Architecture Compliance:
- ✅ Follow PROJECT_STRUCTURE.md directory organization
- ✅ Game logic stays in `src/game/`, UI in `src/components/`
- ✅ Use Zustand stores for all state management
- ✅ No React imports in game logic modules

### Testing Standards:
- ✅ Write tests BEFORE implementing complex logic
- ✅ Maintain >80% coverage on game logic
- ✅ Each new module needs corresponding test file
- ✅ Integration tests for turn sequences

### Performance Considerations:
- ✅ Use React.memo for expensive UI renders
- ✅ Efficient state updates in Zustand stores
- ✅ Animation queuing to prevent performance issues
- ✅ Profile before optimizing

## Risk Mitigation

### High-Risk Areas:
1. **Turn System State Synchronization**: Mitigate by leveraging existing GameStateManager
2. **UI Performance**: Mitigate with React.memo and efficient re-renders
3. **Agent Coordination**: Mitigate with clear integration points and checkpoints

### Contingency Plans:
- If Task 4 takes longer: Delay Task 5, continue Task 12 independently
- If UI integration issues: Rollback to working stores, debug systematically
- If animation performance problems: Start with instant movement, add animations later

## Success Metrics

### Phase 2 Complete When:
- ✅ Player can take turns with movement constraints
- ✅ NPCs move automatically after player turns
- ✅ Complete game UI showing all relevant information
- ✅ Smooth character movement with animations
- ✅ All 150+ tests passing (50+ new tests added)
- ✅ Game is fully playable with pizza delivery mechanics

### Quality Gates:
1. All TypeScript compilation errors resolved
2. All ESLint warnings addressed
3. Build succeeds without warnings
4. Game runs smoothly at 60fps on target hardware

## Next Phase Preview

### Phase 3: Pizza Mechanics (Tasks 7-8)
After Phase 2 completion, next priorities:
- Pizza spawning and pickup systems
- NPC pizza requests and delivery validation
- Level completion and progression logic
- Win/lose conditions and scoring

### Phase 4: Time Manipulation (Tasks 9-11)
The core innovation features:
- Enhanced bitemporal storage
- Pizza-based time abilities (reverse, restart, speedup)
- Ghost replay visualization system

## Architectural Decisions Made

1. **Turn Phases**: Player → NPC → Turn End → New Turn (simple and predictable)
2. **Movement Points**: Start with 1 per turn, extensible for pizza effects
3. **NPC AI**: Simple pathfinding toward objectives (maintains deterministic replays)
4. **UI Layout**: Game grid central, HUD overlay, controls panel (desktop-optimized)
5. **Animation Strategy**: Smooth transitions with configurable speed and queuing

## Open Questions Requiring Decisions

1. **Turn Transition Timing**: Brief pause between phases for clarity?
2. **Pizza Delivery Rules**: Specific NPC requests or any pizza accepted?
3. **Win Conditions**: Deliver all pizzas or meet quota within time limit?
4. **Error Recovery**: How to handle edge cases gracefully?

These questions should be resolved during implementation based on playtesting feedback.

---

This plan provides a clear roadmap for implementing core gameplay features while maintaining architectural integrity and code quality. The parallel development strategy maximizes efficiency while managing integration complexity.