## Open Tasks

### Phase 1: Project Foundation and Core Infrastructure

Id: 1
Title: Initialize React/TypeScript Project
Description: Set up the basic React + TypeScript + Vite project structure with proper dependencies, including Jest for testing. Create initial folder structure and configuration files.
Status: COMPLETED
Blocked by: None
Assigned to: Coding Agent
Completed: React + TypeScript + Vite project initialized with Jest testing, proper folder structure, type definitions, and basic utilities. All tests pass, build succeeds, and project is ready for development.

------

Id: 2
Title: Implement Hexagonal Grid System
Description: Create a hexagonal grid data structure and rendering system. Include utilities for hex coordinate conversion, neighbor calculation, and pathfinding. This is foundational for all gameplay.
Status: COMPLETED
Blocked by: None
Assigned to: Coding Agent
Completed: Complete hexagonal grid system implemented with HexGrid class, advanced coordinate utilities, A* pathfinding, multiple tile types (stone, grass, water, lava), character/pizza placement with collision detection, hex-to-pixel conversion, and comprehensive test suite (35 passing tests). Ready for gameplay systems.

------

Id: 3
Title: Design Core Game State Architecture
Description: Create the main game state structure that can handle bitemporal data (storing game state at each turn). Design interfaces for Game, Level, Character, Item, and Turn data structures.
Status: COMPLETED
Blocked by: None
Assigned to: Coding Agent
Completed: Implemented complete bitemporal game state architecture with BitemporalStore and GameStateManager classes. Supports multiple timelines, time reversal, ghost replay, last-write-wins state merging, dynamic tile changes (water->ice/steam), turn limits, win/lose conditions, and comprehensive event tracking. Includes 39 passing tests covering all edge cases.

------

### Phase 0: Architecture Alignment (URGENT)

Id: 18
Title: Refactor Code to Match Planned Architecture
Description: Move existing code to proper directories according to PROJECT_STRUCTURE.md. Create missing directories (src/game/, src/components/, src/hooks/, src/store/). Move hex utilities to remain in utils/, but create GameEngine in src/game/.
Status: COMPLETED
Blocked by: None
Assigned to: Coding Agent
Priority: HIGH
Completed: Successfully refactored architecture to match PROJECT_STRUCTURE.md. Created src/game/, src/components/, src/hooks/, src/store/ directories. Kept hex.ts in utils/ (generic utility). Created game/hexGrid.ts wrapper that re-exports from utils/hexGrid.ts. Added GameEngine class in src/game/. Moved tests to proper directories. All tests pass (39/39), build succeeds, and code is properly organized according to architectural guidelines.

------

Id: 19
Title: Implement State Management Foundation
Description: Set up state management system using Zustand or Context API. Create stores for GameState, UIState, and TemporalState. This is critical before implementing game loop.
Status: COMPLETED
Blocked by: Task 18
Assigned to: Coding Agent
Priority: HIGH
Completed: Successfully implemented state management foundation using Zustand. Created three stores: GameStore (integrates with GameStateManager for core game logic), UIStore (manages modals, selections, preferences, and feedback messages), and TemporalStore (handles time travel UI and timeline visualization). Added useGameIntegration hook for seamless integration between stores and UI components. All stores include comprehensive type safety, persistence for user preferences, and proper error handling. Includes 30 passing tests covering all store functionality.


------
Id: 20
Title: Implement Extremely simple visualization of level
Description: For immediate feedback of the development process, provide a simple visualization + user interface of the level. Build out a dummy level with an infinite turn timer. Allow the player to move around the level. All code to be implemented now must be temporary, and use docstrings to highlight that this is "tracer bullets" or "jig" code that will be refactored soon.
Status: READY
Priority: HIGH

------

### Phase 2: Basic Gameplay Systems

Id: 4
Title: Implement Turn-Based Game Loop
Description: Create the core turn-based game loop system. Handle player input, character movement, and turn progression. Must integrate with the bitemporal state system.
Status: READY
Blocked by: Task 3 (COMPLETED), Task 19 (COMPLETED)
Assigned to: Coding Agent
Note: This task is now ready to begin as both required dependencies (core game state architecture and state management foundation) are completed.

------

Id: 5
Title: Character Movement System
Description: Implement character movement on the hexagonal grid, including pathfinding, collision detection, and movement validation. Support for different movement speeds.
Status: READY
Blocked by: Task 3 (COMPLETED), Task 19 (COMPLETED)
Assigned to: Coding Agent
Note: This task is now ready to begin as both required dependencies (core game state architecture and state management foundation) are completed.

------

Id: 6
Title: Basic Level Generation
Description: Create procedural level generation system for hex-based levels. Include basic tile types (walkable, blocked, water) and spawn points for characters and items.
Status: READY
Blocked by: Task 3 (COMPLETED), Task 19 (COMPLETED)
Assigned to: Coding Agent
Note: This task is now ready to begin as both required dependencies (core game state architecture and state management foundation) are completed.

------

### Phase 3: Pizza Delivery Mechanics

Id: 7
Title: Pizza and NPC System
Description: Implement pizza spawning, pickup, and delivery mechanics. Create NPC characters that move and request pizzas. Handle the one-pizza-at-a-time inventory constraint.
Status: BLOCKED
Blocked by: Tasks 4, 5
Assigned to: Coding Agent

------

Id: 8
Title: Level Completion Logic
Description: Implement win/lose conditions, level timers, and progression to next level. Handle the scoring system and level completion detection.
Status: BLOCKED
Blocked by: Task 7
Assigned to: Coding Agent

------

### Phase 4: Time Manipulation System (Core Innovation)

Id: 9
Title: Bitemporal State Storage
Description: Implement the bitemporal state system that stores the complete game state at each turn. This enables time travel and replay functionality.
Status: BLOCKED
Blocked by: Tasks 3, 4
Assigned to: Coding Agent
Implementation Notes:
- Use immutable data structures for state snapshots
- Consider implementing state compression after 100 turns
- Create efficient diff/patch system for state changes
- Ensure serialization works for save/load functionality

------

Id: 10
Title: Time Manipulation Abilities
Description: Implement the different pizza-based time abilities: speed boost (Pepperoni), time reversal (Sausage), and level restart (Supreme). Handle the complex interactions with the bitemporal system.
Status: BLOCKED
Blocked by: Task 9
Assigned to: Coding Agent

------

Id: 11
Title: Ghost Replay System
Description: Create the "ghost" visualization system that shows the player's previous actions when they replay a level. Handle the rendering of multiple timeline states.
Status: BLOCKED
Blocked by: Task 10
Assigned to: Coding Agent

------

### Phase 5: UI and Polish

Id: 12
Title: Game UI Components
Description: Create the main game UI including hex grid display, character rendering, inventory display, timer, and controls. Ensure responsive design for desktop.
Status: READY
Blocked by: Task 3 (COMPLETED), Task 19 (COMPLETED)
Assigned to: Coding Agent
Note: This task is now ready to begin as both required dependencies (core game state architecture and state management foundation) are completed.

------

Id: 13
Title: Cutscene System
Description: Implement the dialogue and cutscene system for story progression. Create simple dialogue UI and progression controls.
Status: BLOCKED
Blocked by: Task 12
Assigned to: Coding Agent

------

### Phase 6: Level Design and Content

Id: 14
Title: Static Level Design
Description: Create the 7 static levels (1, 5, 10, 15, 20, 25, 30) with custom layouts and scenarios. Implement level loading system.
Status: BLOCKED
Blocked by: Tasks 6, 8
Assigned to: Coding Agent

------

Id: 15
Title: Level Archetypes
Description: Design and implement the Ancient, Present, and Modern level archetypes for procedurally generated levels. Create visual themes and unique mechanics for each.
Status: BLOCKED
Blocked by: Tasks 6, 14
Assigned to: Coding Agent

------

### Architecture Guidelines for Coding Agents

**IMPORTANT**: When implementing any task, follow these guidelines:

1. **Directory Structure**: Always place code in the correct directory:
   - Game logic → src/game/
   - React components → src/components/
   - State management → src/store/
   - Generic utilities → src/utils/
   - Type definitions → src/types/

2. **Separation of Concerns**:
   - NEVER import React components into game logic
   - NEVER put game logic directly in components
   - Use the store layer to bridge game and UI

3. **Testing Requirements**:
   - Write tests BEFORE implementing complex logic
   - Each module should have a corresponding test file
   - Aim for >80% coverage on game logic

4. **Performance Awareness**:
   - Consider memory usage for bitemporal storage
   - Profile before optimizing
   - Document any performance-critical decisions

------

### Phase 7: Testing and Integration

Id: 16
Title: Comprehensive Testing Suite
Description: Create comprehensive unit tests for all major systems, especially the complex bitemporal and time manipulation systems. Ensure edge cases are covered.
Status: BLOCKED
Blocked by: Tasks 9, 10, 11
Assigned to: Coding Agent

------

Id: 17
Title: Integration and Bug Fixes
Description: Integrate all systems, perform end-to-end testing, and fix any issues that arise from system interactions.
Status: BLOCKED
Blocked by: All previous tasks
Assigned to: Coding Agent

------
