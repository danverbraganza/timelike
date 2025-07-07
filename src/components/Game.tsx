import React, { useEffect, useState, useCallback } from 'react';
import { HexGridVisualization } from './HexGridVisualization';
import { IsometricHexGridVisualization } from './IsometricHexGridVisualization';
import { useGameIntegration } from '../hooks/useGameIntegration';
import { useUIStore } from '../store/uiStore';
import { createSimpleTestLevel } from '../game/levelGenerator';
import { GameEngine } from '../game/GameEngine';
import type { HexCoordinate, Character, Pizza } from '../types/game';
import { hexEquals } from '../utils/hex';

export const Game: React.FC = () => {
  const gameIntegration = useGameIntegration();
  const { isometricView, toggleIsometricView } = useUIStore();
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [gameInitialized, setGameInitialized] = useState(false);

  // Initialize the game when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Create a simple test level using procedural generation
        const { level, player, pizzas: testPizzas } = createSimpleTestLevel({
          width: 14,
          height: 12,
          algorithm: 'hybrid',
          seed: 42,
        });
        
        // Create game engine
        const engine = new GameEngine({
          width: level.width,
          height: level.height,
          defaultTileType: 'grass',
        });
        
        // Set the procedurally generated tiles
        const grid = engine.getGrid();
        grid.setTiles(level.tiles);
        
        // Add player to the grid
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
        
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    if (!gameInitialized) {
      initializeGame();
    }
  }, [gameInitialized]);

  // Handle hex click for player movement
  const handleHexClick = useCallback(async (position: HexCoordinate) => {
    if (!gameEngine || !gameInitialized) {
      return;
    }
    
    const grid = gameEngine.getGrid();
    const player = characters.find(c => c.type === 'player');
    
    if (!player) {
      return;
    }
    
    // Check if the clicked position is different from player's current position
    if (hexEquals(player.position, position)) {
      return;
    }
    
    // Check if the position is walkable
    if (!grid.isTileWalkable(position)) {
      return;
    }
    
    // Check if there's already a character at the position
    if (grid.getCharacterAt(position)) {
      return;
    }
    
    // Move in the game engine grid
    try {
      const moveSuccess = grid.moveCharacter(player.id, position);
      
      if (moveSuccess) {
        // Update local character state immediately
        setCharacters(prev => prev.map(char => 
          char.id === player.id 
            ? { ...char, position }
            : char
        ));
        
        // Check if player picked up a pizza
        const pizzaAtPosition = grid.getPizzaAt(position);
        if (pizzaAtPosition) {
          grid.removePizza(pizzaAtPosition.id);
          setPizzas(prev => prev.filter(p => p.id !== pizzaAtPosition.id));
        }
      }
    } catch (error) {
      console.error('Error moving player:', error);
    }
  }, [gameEngine, gameInitialized, characters]);

  // Show loading state
  if (!gameInitialized || !gameEngine) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '1.2em'
      }}>
        Loading Game...
      </div>
    );
  }

  const grid = gameEngine.getGrid();
  const allTiles = grid.getAllTiles();

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }}>
      {/* Game View - Full Screen */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isometricView ? (
          <IsometricHexGridVisualization
            tiles={allTiles}
            characters={characters}
            pizzas={pizzas}
            onHexClick={handleHexClick}
            onHexHover={(hex) => gameIntegration.hoverHex(hex || undefined)}
            selectedHex={gameIntegration.selectedHex}
            hoveredHex={gameIntegration.hoveredHex}
            hexSize={35}
          />
        ) : (
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
        )}
      </div>

      {/* Translucent Toolbar Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button 
          onClick={toggleIsometricView}
          style={{
            padding: '12px 24px',
            backgroundColor: isometricView ? 'rgba(0, 123, 255, 0.8)' : 'rgba(40, 167, 69, 0.8)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = isometricView ? 'rgba(0, 123, 255, 1)' : 'rgba(40, 167, 69, 1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = isometricView ? 'rgba(0, 123, 255, 0.8)' : 'rgba(40, 167, 69, 0.8)';
          }}
        >
          {isometricView ? '🎮 Switch to Flat View' : '✨ Switch to 3D View'}
        </button>
      </div>
    </div>
  );
};