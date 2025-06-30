import React, { useEffect, useState } from 'react';
import { HexGridVisualization } from './HexGridVisualization';
import { useGameIntegration } from '../hooks/useGameIntegration';
import { createSimpleTestLevel } from '../game/levelGenerator';
import { GameEngine } from '../game/GameEngine';
import type { HexCoordinate, Character, Pizza } from '../types/game';
import { hexEquals } from '../utils/hex';

/**
 * TRACER BULLETS / JIG CODE - This is temporary game component
 * TODO: This should be refactored into proper game UI system
 * with better separation of concerns, proper state management,
 * and real game features when building the actual game
 */

export const Game: React.FC = () => {
  const gameIntegration = useGameIntegration();
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [gameInitialized, setGameInitialized] = useState(false);

  // TRACER BULLETS: Initialize the game when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.log('TRACER BULLETS: Initializing test game...');
        
        // Create a simple test level
        const { level, player, pizzas: testPizzas } = createSimpleTestLevel({
          width: 10,
          height: 8,
          addObstacles: true,
          addPizzas: true,
        });
        
        // Create game engine
        const engine = new GameEngine({
          width: level.width,
          height: level.height,
          defaultTileType: 'grass',
        });
        
        // Add player to the grid
        const grid = engine.getGrid();
        grid.addCharacter(player);
        
        // Add pizzas to the grid
        testPizzas.forEach(pizza => {
          grid.addPizza(pizza);
        });
        
        // Initialize game state via the integration hook
        await gameIntegration.initializeGame(level);
        
        setGameEngine(engine);
        setCharacters([player]);
        setPizzas(testPizzas);
        setGameInitialized(true);
        
        console.log('TRACER BULLETS: Game initialized successfully!');
        console.log('Level tiles:', level.tiles.size);
        console.log('Player position:', player.position);
        console.log('Pizzas:', testPizzas.length);
        
      } catch (error) {
        console.error('TRACER BULLETS: Failed to initialize game:', error);
      }
    };

    if (!gameInitialized) {
      initializeGame();
    }
  }, [gameInitialized]); // Remove gameIntegration from dependencies to prevent infinite loop

  // TRACER BULLETS: Handle hex click for player movement
  const handleHexClick = async (position: HexCoordinate) => {
    if (!gameEngine || !gameInitialized) return;
    
    console.log('TRACER BULLETS: Hex clicked:', position);
    
    const grid = gameEngine.getGrid();
    const player = characters.find(c => c.type === 'player');
    
    if (!player) {
      console.log('TRACER BULLETS: No player found');
      return;
    }
    
    // Check if the clicked position is different from player's current position
    if (hexEquals(player.position, position)) {
      console.log('TRACER BULLETS: Player already at this position');
      return;
    }
    
    // Check if the position is walkable
    if (!grid.isTileWalkable(position)) {
      console.log('TRACER BULLETS: Position not walkable');
      return;
    }
    
    // Check if there's already a character at the position
    if (grid.getCharacterAt(position)) {
      console.log('TRACER BULLETS: Position occupied by another character');
      return;
    }
    
    // Try to move the player
    try {
      const success = await gameIntegration.moveCharacter(player.id, position);
      if (success) {
        console.log('TRACER BULLETS: Player moved successfully to:', position);
        
        // Update local character state
        setCharacters(prev => prev.map(char => 
          char.id === player.id 
            ? { ...char, position }
            : char
        ));
        
        // Check if player picked up a pizza
        const pizzaAtPosition = grid.getPizzaAt(position);
        if (pizzaAtPosition) {
          console.log('TRACER BULLETS: Player picked up pizza:', pizzaAtPosition.id);
          setPizzas(prev => prev.filter(p => p.id !== pizzaAtPosition.id));
        }
        
      } else {
        console.log('TRACER BULLETS: Move failed (game logic prevented it)');
      }
    } catch (error) {
      console.error('TRACER BULLETS: Error moving player:', error);
    }
  };

  // Show loading state
  if (!gameInitialized || !gameEngine) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>TRACER BULLETS - Loading Game...</h2>
        <p>Initializing hex grid and game state...</p>
      </div>
    );
  }

  const grid = gameEngine.getGrid();
  const allTiles = grid.getAllTiles();

  return (
    <div style={{ padding: '20px' }}>
      <h1>TRACER BULLETS - Timelike Game Visualization</h1>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        marginBottom: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px'
      }}>
        <h3>🔧 Debug Information (TRACER BULLETS)</h3>
        <p><strong>Game Status:</strong> {gameInitialized ? 'Initialized' : 'Loading'}</p>
        <p><strong>Total Tiles:</strong> {allTiles.length}</p>
        <p><strong>Characters:</strong> {characters.length}</p>
        <p><strong>Pizzas:</strong> {pizzas.length}</p>
        <p><strong>Player Position:</strong> {characters[0] ? `(${characters[0].position.q}, ${characters[0].position.r})` : 'None'}</p>
        <p><strong>Instructions:</strong> Click on any green hex to move the blue circle (player)</p>
      </div>

      <HexGridVisualization
        tiles={allTiles}
        characters={characters}
        pizzas={pizzas}
        onHexClick={handleHexClick}
        onHexHover={(hex) => gameIntegration.hoverHex(hex || undefined)}
        selectedHex={gameIntegration.selectedHex}
        hoveredHex={gameIntegration.hoveredHex}
        hexSize={35}
      />
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#666',
        background: '#fff3cd',
        padding: '10px',
        border: '1px solid #ffeaa7',
        borderRadius: '5px'
      }}>
        <strong>🚧 TRACER BULLETS Code Notice:</strong> This is temporary visualization code 
        for immediate feedback. All components here are marked for refactoring once 
        the basic gameplay loop is validated.
      </div>
    </div>
  );
};