import { HexGrid } from './hexGrid';
import type { HexGridOptions } from './hexGrid';

/**
 * GameEngine class manages the core game state and logic
 * This is the main entry point for all game operations
 */
export class GameEngine {
  private hexGrid: HexGrid;
  
  constructor(gridOptions: HexGridOptions) {
    this.hexGrid = new HexGrid(gridOptions);
  }

  /**
   * Get the hex grid instance
   */
  getGrid(): HexGrid {
    return this.hexGrid;
  }

  /**
   * Initialize a new game with default settings
   */
  initializeGame(): void {
    // Clear any existing entities
    this.hexGrid.clearEntities();
    
    // Future: Initialize game state, spawn entities, etc.
  }

  /**
   * Get game statistics
   */
  getStats() {
    return {
      grid: this.hexGrid.getGridStats(),
      // Future: Add more game-specific stats
    };
  }
}