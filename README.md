# Project Timelike

A design for a turn-based hexagon based roguelike with time travel dynamics,
with working title Timelike.

Timelike is a project that will be coded either entirely or in great part by
automated coding agents. For this reason, it is important that the project be
worked on methodically and strategically.

## Overall Gameplay

Timelike is a Roguelike game, in that the player attempts to clear 30 levels in
order. If the player loses the game, the player must restart from the beginning.
There may be certain effects and achievable bonuses which will persist from game
to game, but these have not been decided.

Most levels are procedurally generated, but there are a few key levels that will
be custom designed and the same every time.

Each level is made of a hexagonal grid, which the player must navigate. Also on the
grid are:

* Power-ups, which give the player status effects for some time
* Other characters, whether enemies or friends
* Hex tiles can have effects on them. E.g. Tiles may be blocked, preventing
  travel at all, or full of water, requiring an item which grants swimming
  before they can be traveresed.

Most levels will have a timer, in which the level must be completed. A level is
completed by picking up pizzas from pickup locations, and delivering them to
characters who have requested them.

The level is turn-based, on each turn the player may move a set number of steps
(starting with 1), and then all other characters move.

Pizzas will spawn infinitely, but the locations where they spawn are fixed. Each
pizza will have one and exactly one target, who will be moving around. You may
carry only one pizza at a time.

The key innovation of Timelike is that a good amount of items in the game allow
you to interact with time in multiple ways:

* Cheese Pizza is basic
* Pepperoni Pizza will speed you up, allowing you to move additional steps per turn
* Sausage Pizza will start time to run in reverse for 5 turns, allowing you to move forward while other players move backwards
* Supreme Pizza will allow you to re-begin the level at the starting time.

The key innovation and technical challenge of timelike is that the level will
keep track of time in a bitemporal manner. The location and actions of each
character and item at each turn are stored, so that the "active" player is able
to revisit past turns and view them in action. At such times, the player views a
"ghost" of themselves who will always perform the predetermined actions that
player did the first time through. There is no official limit on how much a
player may replay a game, as long as they can collect sufficient time-altering
pizzas.

At the beginning, end or triggered at different points of a level, a level might
have a cutscene. During a cutscene, pre-prepared dialog will play. The player's
only action is to press the "next" button, acknowledging they have read the
dialogue.

## Coordination

Coding agents working on this game can come in two flavours:

* Planning Agents
* Coding Agents

You will be prompted appropriately to let you know what kind of agent you are.

Planning Agents _only_ plan, and do not write code.

Coding Agents code in as limited a fashions as possible, to narrowly fit the
problem definition. Any open questions that a Coding Agent has will be added to QUESTIONS.md

**CRITICAL for Coding Agents**: Before starting any implementation work, you MUST:
1. Read and understand PROJECT_STRUCTURE.md - this defines the required directory structure and architecture
2. Review TASKS.md to understand task dependencies and current priorities
3. Check QUESTIONS.md for any architectural concerns or blockers
4. Follow the Software Architecture guidelines below strictly

### Current Project Status

**Phase 1 Complete**: Basic project setup and hexagonal grid system are implemented and tested.

**Architecture Alignment Needed**: The codebase needs restructuring to match the planned architecture before proceeding with game features. See Tasks 18 and 19 in TASKS.md.

**Next Priority**: Establish proper separation between game logic and UI before implementing the core game loop


## Level Design

Levels 1, 5, 10, 15, 20, 25 and 30 are going to be static, fixed levels. For now, we can just have the player sit in them with infinite time.

The other levels will have a certain archetype. Ancient, Present and
Modern--this will be refined later.

## Software Architecture

We want to rapidly prototype and iterate this project, and ensure that multiple
coding agents can effectively collaborate on the design.

* The game is played on a web-first, desktop sized UI.
* We will use React and a vite server to simplify the design.
* Typescript will be used for type safety. Please ensure tests and typechecks
  always pass.
* jest will be used to verify the tests of the system. Please adequately test
  all significantly complex components.
* Gameplay is more of an immediate priority than visual polish. To ensure we can
  rapidly replace the UI with something better, decouple game state and the main
  game loop from the user interface design.
* Any persistent state can be stored in local storage for now, but keep it
  abstractable so that we can build this in a backend-aware way later.

### Architecture Guidelines

1. **Separation of Concerns**: 
   - Game logic MUST be kept in `src/game/` directory, completely separate from React components
   - UI components in `src/components/` should only handle presentation and user input
   - State management in `src/store/` should bridge game logic and UI

2. **Module Organization**:
   - `src/game/` - Core game engine, turn logic, time manipulation
   - `src/components/` - React UI components
   - `src/hooks/` - Custom React hooks for game integration
   - `src/store/` - State management (consider Zustand for simplicity)
   - `src/types/` - TypeScript type definitions
   - `src/utils/` - Generic utilities (hex math, etc.)

3. **Testing Strategy**:
   - Unit tests for all game logic modules
   - Integration tests for complex temporal interactions
   - Component tests for UI elements
   - Maintain >80% coverage for critical game systems

4. **Performance Considerations**:
   - Bitemporal state storage will grow linearly with turns
   - Consider implementing state compression after 100 turns
   - Use React.memo and useMemo for expensive grid renders
   - Profile before optimizing
