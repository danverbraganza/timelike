# Project Structure

## Directory Layout

```
timelike/
├── src/
│   ├── components/       # React UI components (Game, HexGridVisualization)
│   ├── game/            # Core game logic (GameEngine, level generation, bitemporal state)
│   ├── hooks/           # Custom React hooks (useGameIntegration)
│   ├── store/           # State management (Zustand stores: Game, UI, Temporal)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (hex math, grid utilities)
│   └── __tests__/       # Test files (organized by module)
├── public/              # Static assets
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
├── tsconfig.test.json   # TypeScript configuration for tests
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies
```

## Key Design Principles

1. **Separation of Concerns**: Game logic is kept separate from UI components using Zustand stores
2. **Type Safety**: Full TypeScript coverage with strict type checking
3. **Testability**: Jest configured with React Testing Library and comprehensive test coverage
4. **Modularity**: Code organized to support multiple coding agents working in parallel
5. **Extensibility**: Procedural generation and game systems designed for easy extension

## Current Implementation Status

- ✅ **Architecture Foundation**: Complete with proper separation of concerns
- ✅ **State Management**: Zustand stores for Game, UI, and Temporal state
- ✅ **Game Visualization**: SVG-based hex grid with interactive gameplay
- ✅ **Level Generation**: Multiple algorithms (Perlin noise, cellular automata, simple random)
- ✅ **Core Game Systems**: Bitemporal state management and game engine foundation

## Testing

- Run tests: `npm test`
- Run tests in watch mode: `npm test:watch`
- Run tests with coverage: `npm test:coverage`
- Type checking: `npm run typecheck`

## Development

- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Run linter: `npm run lint`