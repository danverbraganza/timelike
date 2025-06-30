# Project Structure

## Directory Layout

```
timelike/
├── src/
│   ├── components/       # React UI components
│   ├── game/            # Core game logic (decoupled from UI)
│   ├── hooks/           # Custom React hooks
│   ├── store/           # State management
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── __tests__/       # Test files
├── public/              # Static assets
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
├── tsconfig.test.json   # TypeScript configuration for tests
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies
```

## Key Design Principles

1. **Separation of Concerns**: Game logic is kept separate from UI components
2. **Type Safety**: Full TypeScript coverage with strict type checking
3. **Testability**: Jest configured with React Testing Library
4. **Modularity**: Code organized to support multiple coding agents working in parallel

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