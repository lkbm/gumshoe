// Core game types for Gumshoe

export type Direction = 'north' | 'south' | 'east' | 'west';

export interface Door {
  toRoomId: string;
  direction: Direction;
  // Position along the wall (0-1, where 0.5 is center)
  position: number;
}

export interface Room {
  id: string;
  name: string;
  // Grid position (top-left corner)
  x: number;
  y: number;
  // Size in grid units
  width: number;
  height: number;
  doors: Door[];
}

export type Gender = 'male' | 'female';

export interface NPC {
  id: string;
  name: string;
  gender: Gender;
  currentRoom: string;
  // Alibi: who they claim to have been with and where
  alibi: {
    withWhom: string; // NPC id
    inRoom: string;   // Room id
  } | null;
  // Clues this NPC will share when questioned
  clues: string[];
  isMurderer: boolean;
}

// Pronoun helper type
export interface Pronouns {
  subject: string;    // he/she
  object: string;     // him/her
  possessive: string; // his/her
  reflexive: string;  // himself/herself
}

export interface Item {
  id: string;
  name: string;
  room: string;         // Room id where item is located
  isMurderWeapon: boolean;
  canTake: boolean;
  description: string;  // What you see when examining
}

export type GamePhase = 'intro' | 'playing' | 'assembled' | 'won' | 'lost';

export interface GameState {
  // Player state
  currentRoom: string;
  inventory: string[];  // Item ids

  // World state
  rooms: Room[];
  npcs: NPC[];
  items: Item[];

  // Mystery solution
  murderWeapon: string; // Item id
  murderRoom: string;   // Room id
  murderer: string;     // NPC id
  victim: string;       // Name of victim (not an active NPC)

  // UI state
  messages: string[];
  selectedEntity: { type: 'npc' | 'item'; id: string } | null;
  gamePhase: GamePhase;
}

// Selection state for interactions
export type Selection =
  | { type: 'npc'; npc: NPC }
  | { type: 'item'; item: Item }
  | null;

// Actions the player can take
export type GameAction =
  | { type: 'MOVE'; toRoom: string }
  | { type: 'EXAMINE'; itemId: string }
  | { type: 'TAKE'; itemId: string }
  | { type: 'QUESTION'; npcId: string }
  | { type: 'ALIBI'; npcId: string }
  | { type: 'ASSEMBLE' }
  | { type: 'ACCUSE'; npcId: string }
  | { type: 'SELECT'; entity: { type: 'npc' | 'item'; id: string } | null }
  | { type: 'NEW_GAME' };

// House layout configuration
export interface HouseLayout {
  name: string;
  rooms: Room[];
  startingRoom: string;
}

// Mystery configuration
export interface MysteryConfig {
  npcCount: number;
  itemCount: number;
}
