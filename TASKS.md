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
Status: COMPLETED
Priority: HIGH
Completed: Complete game visualization system implemented with SVG-based hex grid rendering, click-to-move player functionality, Game component integration with state management, HexGridVisualization component with comprehensive tile rendering, debug information display, game legend, and seamless integration with procedural level generation. All code properly marked as "TRACER BULLETS/JIG CODE" for future refactoring as specified. Enhanced with hex click fixes and improved user experience.

------

### Phase 2: Basic Gameplay Systems

Id: 4
Title: Implement Turn-Based Game Loop
Description: Create the core turn-based game loop system. Handle player input, character movement, and turn progression. Must integrate with the bitemporal state system.
Status: READY
Blocked by: Task 3 (COMPLETED), Task 19 (COMPLETED)
Assigned to: Coding Agent
Priority: CRITICAL - This unlocks most other gameplay features

## DETAILED IMPLEMENTATION SPECIFICATION:

### Core Requirements:
1. **Turn System Architecture**:
   - Create `TurnManager` class in `src/game/TurnManager.ts`
   - Phases: Player Phase → NPC Phase → Turn End → New Turn
   - Track current turn number, phase, and active character
   - Integration with existing GameStateManager for bitemporal storage

2. **Player Phase Logic**:
   - Allow player movement within movement point constraints (start with 1 point per turn)
   - Handle pizza pickup/delivery actions
   - Validate all actions before execution
   - End phase when player confirms "End Turn" or uses all actions

3. **NPC Phase Logic**:
   - Simple AI: NPCs move toward nearest pizza or player
   - Each NPC gets movement points based on their stats
   - NPCs respect terrain and collision rules
   - Process NPCs in deterministic order (by ID)

4. **Turn Progression**:
   - Save complete turn state to bitemporal store
   - Increment turn counter
   - Reset movement points for all characters
   - Check win/lose conditions
   - Handle level timer if applicable

5. **State Integration**:
   - Use existing GameStore for turn state management
   - Fire events for UI updates (turn change, phase change)
   - Maintain compatibility with existing useGameIntegration hook

### Implementation Files:
- `src/game/TurnManager.ts` - Core turn logic
- `src/game/ai/SimpleAI.ts` - Basic NPC behavior
- Update `src/store/gameStore.ts` - Add turn management actions
- `src/__tests__/game/TurnManager.test.ts` - Comprehensive tests

### Success Criteria:
- Player can take actions and end turn
- NPCs move automatically after player
- Turn counter advances correctly
- All actions properly logged in bitemporal store
- UI reflects current turn/phase state
- 15+ unit tests covering all scenarios

### Architecture Notes:
- Keep turn logic separate from UI components
- Use event system for loose coupling
- Design for future time manipulation features
- Follow existing patterns in GameStateManager

------

Id: 5
Title: Character Movement System
Description: Implement character movement on the hexagonal grid, including pathfinding, collision detection, and movement validation. Support for different movement speeds.
Status: READY
Blocked by: Task 4 (Turn-Based Game Loop) - Movement must respect turn constraints
Assigned to: Coding Agent
Priority: HIGH - Core gameplay mechanic

## DETAILED IMPLEMENTATION SPECIFICATION:

### Core Requirements:
1. **Enhanced Movement System**:
   - Extend existing click-to-move with turn-based constraints
   - Movement point system (characters have movement points per turn)
   - Path preview before movement execution
   - Animated movement transitions
   - Support for different movement speeds per character type

2. **Movement Validation**:
   - Check movement points available
   - Validate path is clear and walkable
   - Prevent movement through other characters
   - Handle special terrain effects (water requires swimming, etc.)
   - Respect turn phase (only active character can move)

3. **Path Visualization**:
   - Show movement path preview on hover
   - Highlight valid movement range
   - Display movement cost for each hex
   - Visual feedback for invalid moves

4. **Animation System**:
   - Smooth character transitions between hexes
   - Configurable animation speed (via UIStore preferences)
   - Queue movements for smooth multi-step paths
   - Pause for animations before next character's turn

5. **Pizza Effects Integration**:
   - Pepperoni Pizza: +1 movement point
   - Design extensible system for future pizza effects
   - Track and display active effects per character

### Implementation Files:
- `src/game/MovementSystem.ts` - Core movement logic and validation
- `src/game/PathPreview.ts` - Path visualization and range calculation
- `src/components/MovementAnimation.tsx` - Animation components
- Update `src/store/gameStore.ts` - Add movement actions and state
- Update `src/components/HexGridVisualization.tsx` - Add path preview rendering
- `src/__tests__/game/MovementSystem.test.ts` - Movement logic tests

### Success Criteria:
- Characters move smoothly with animations
- Movement respects turn-based constraints
- Path preview shows before movement
- Movement points correctly tracked and displayed
- Different character types can have different movement speeds
- All movements properly validated
- 20+ unit tests covering all movement scenarios

### Architecture Notes:
- Build on existing A* pathfinding from Task 2
- Integrate with TurnManager from Task 4
- Keep movement logic in game layer, animations in UI
- Use existing coordinate system and hex utilities
- Design for future time manipulation features

### UI Integration:
- Show movement points remaining in character info
- Highlight movement range on character selection
- Display path preview on hex hover
- Add "End Turn" button when movement is complete

------

Id: 6
Title: Basic Level Generation
Description: Create procedural level generation system for hex-based levels. Include basic tile types (walkable, blocked, water) and spawn points for characters and items.
Status: COMPLETED
Blocked by: None
Assigned to: Coding Agent
Completed: Advanced procedural level generation system implemented with multiple algorithms (Perlin noise, cellular automata, simple random). Features extensible architecture with abstract base class, new tile types (Sand, Dirt, Steel, Void), seeded random generation for reproducible levels, safety zones around spawns, and comprehensive configuration system. ProceduralLevelGenerator class coordinates algorithms with type-safe configuration. Fully integrated with game engine and visualization system.

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
Priority: HIGH - Can be developed in parallel with turn system

## DETAILED IMPLEMENTATION SPECIFICATION:

### Core UI Components:
1. **Game HUD (Heads-Up Display)**:
   - Create `src/components/GameHUD.tsx`
   - Turn counter and phase indicator
   - Level timer (countdown display)
   - Current player indicator
   - Movement points remaining
   - Pizza inventory display

2. **Control Panel**:
   - Create `src/components/GameControls.tsx`
   - "End Turn" button (enabled only during player phase)
   - "Pause Game" button
   - "Settings" button
   - "Restart Level" button
   - View toggle (2D/Isometric)

3. **Character Info Panel**:
   - Create `src/components/CharacterInfo.tsx`
   - Selected character stats
   - Movement points available
   - Active pizza effects
   - Pizza carried (if any)

4. **Level Info Display**:
   - Create `src/components/LevelInfo.tsx`
   - Level number and name
   - Objectives (pizzas to deliver)
   - Time remaining
   - Score/progress tracking

5. **Status Messages**:
   - Extend existing success/error message system
   - Turn transition notifications
   - Action feedback ("Player moved", "Pizza picked up")
   - Invalid action warnings

### Layout and Responsive Design:
1. **Desktop Layout**:
   - Game grid as main content (existing)
   - HUD overlay on top/sides
   - Control panel on right side
   - Status messages in top-right corner

2. **Component Integration**:
   - All components use existing Zustand stores
   - No direct game logic in UI components
   - Clean integration with useGameIntegration hook

### Implementation Files:
- `src/components/GameHUD.tsx` - Main game status display
- `src/components/GameControls.tsx` - Game control buttons
- `src/components/CharacterInfo.tsx` - Character stats panel
- `src/components/LevelInfo.tsx` - Level status and objectives
- `src/components/StatusMessage.tsx` - Enhanced message display
- Update `src/components/Game.tsx` - Integrate new UI components
- Update `src/components/index.ts` - Export new components
- `src/__tests__/components/GameHUD.test.tsx` - UI component tests

### Success Criteria:
- All game information clearly displayed
- Turn system controls functional
- Responsive layout works on different screen sizes
- UI updates in real-time with game state
- All interactions properly integrated with stores
- 15+ component tests with React Testing Library
- Clean, consistent visual design

### Design Requirements:
- Follow existing color scheme (neon/mystic theme)
- Use consistent spacing and typography
- Accessible design (proper contrast, keyboard navigation)
- Smooth transitions and hover effects
- Visual feedback for all interactive elements

### Architecture Notes:
- UI components only handle presentation
- All state accessed through Zustand stores
- Event handlers delegated to useGameIntegration
- Modular design for easy extension
- Performance optimized with React.memo where needed

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
Status: READY
Blocked by: Task 8
Assigned to: Coding Agent
Note: This task is now ready to begin as Task 6 (level generation) is completed. Only blocked by Task 8 (level completion logic).

------

Id: 15
Title: Level Archetypes
Description: Design and implement the Ancient, Present, and Modern level archetypes for procedurally generated levels. Create visual themes and unique mechanics for each.
Status: READY
Blocked by: Task 14
Assigned to: Coding Agent
Note: This task is now ready to begin as Task 6 (level generation) is completed. Only blocked by Task 14 (static level design).

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
