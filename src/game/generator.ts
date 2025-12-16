import { GameState, NPC, Item, Room, Gender } from './types';
import {
  DEFAULT_LAYOUT,
  NPC_DATA,
  WEAPONS,
  shuffle,
  pickRandom,
  pickOne,
} from './houseLayouts';
import { generateCluesForNPC } from './dialogue';

export interface GeneratorConfig {
  npcCount?: number; // Default 7 (6 suspects + 1 victim)
}

/**
 * Generate a new mystery game state
 */
export function generateMystery(config: GeneratorConfig = {}): GameState {
  const { npcCount = 7 } = config;

  const rooms = DEFAULT_LAYOUT.rooms;

  // Pick NPCs - one will be the victim, one the murderer
  const selectedNPCs = pickRandom(NPC_DATA, npcCount);
  const victim = selectedNPCs[0];
  const murderer = selectedNPCs[1];
  const suspects = selectedNPCs.slice(1); // Everyone except victim

  // Pick murder details
  const murderRoom = pickOne(rooms);
  const murderWeapon = pickOne(WEAPONS);

  // Create NPCs (suspects only, victim is dead)
  const npcs = createNPCs(suspects, murderer.name, rooms);

  // Create items - scatter weapons around, including murder weapon in murder room
  const items = createItems(murderWeapon, murderRoom, rooms);

  // Generate alibis for innocent NPCs
  assignAlibis(npcs, rooms);

  // Generate clues for each NPC
  generateAllClues(npcs, victim, murderer, murderRoom, murderWeapon.name);

  return {
    currentRoom: DEFAULT_LAYOUT.startingRoom,
    inventory: [],
    rooms,
    npcs,
    items,
    murderWeapon: 'weapon-murder',
    murderRoom: murderRoom.id,
    murderer: murderer.name.toLowerCase().replace(/\s+/g, '-'),
    victim: victim.name,
    messages: [
      `Welcome to Blackwood Manor, Inspector.`,
      `${victim.name} has been found murdered!`,
      `Question the suspects, examine the evidence, and solve the case.`,
      `When ready, pick up the murder weapon, go to the murder room, ASSEMBLE the suspects, and ACCUSE the guilty party.`,
    ],
    selectedEntity: null,
    gamePhase: 'playing',
  };
}

/**
 * Create NPC objects and distribute them across rooms
 */
function createNPCs(
  npcData: Array<{ name: string; gender: Gender }>,
  murdererName: string,
  rooms: Room[]
): NPC[] {
  const shuffledRooms = shuffle(rooms);

  return npcData.map((data, index) => ({
    id: data.name.toLowerCase().replace(/\s+/g, '-'),
    name: data.name,
    gender: data.gender,
    currentRoom: shuffledRooms[index % shuffledRooms.length].id,
    alibi: null, // Will be assigned later
    clues: [], // Will be generated later
    isMurderer: data.name === murdererName,
  }));
}

/**
 * Create items including the murder weapon
 */
function createItems(
  murderWeapon: { name: string; description: string },
  murderRoom: Room,
  rooms: Room[]
): Item[] {
  const items: Item[] = [];

  // Place the murder weapon in the murder room
  items.push({
    id: 'weapon-murder',
    name: murderWeapon.name,
    room: murderRoom.id,
    isMurderWeapon: true,
    canTake: true,
    description: murderWeapon.description,
  });

  // Add some red herring weapons in other rooms
  const otherWeapons = WEAPONS.filter((w) => w.name !== murderWeapon.name);
  const otherRooms = rooms.filter((r) => r.id !== murderRoom.id);
  const decoyWeapons = pickRandom(otherWeapons, Math.min(3, otherRooms.length));

  decoyWeapons.forEach((weapon, index) => {
    items.push({
      id: `weapon-decoy-${index}`,
      name: weapon.name,
      room: otherRooms[index].id,
      isMurderWeapon: false,
      canTake: true,
      description: weapon.description,
    });
  });

  return items;
}

/**
 * Assign alibis to innocent NPCs
 * ALL innocents get alibis - only the murderer has no alibi
 * This makes alibis a reliable way to eliminate suspects
 */
function assignAlibis(npcs: NPC[], rooms: Room[]): void {
  const innocents = npcs.filter((npc) => !npc.isMurderer);
  const shuffledInnocents = shuffle(innocents);
  const alibiRooms = shuffle(rooms);

  // Pair up innocents for alibis
  for (let i = 0; i < shuffledInnocents.length; i += 2) {
    if (i + 1 < shuffledInnocents.length) {
      // Pair two innocents together
      const npc1 = shuffledInnocents[i];
      const npc2 = shuffledInnocents[i + 1];
      const alibiRoom = alibiRooms[Math.floor(i / 2) % alibiRooms.length];

      npc1.alibi = { withWhom: npc2.id, inRoom: alibiRoom.id };
      npc2.alibi = { withWhom: npc1.id, inRoom: alibiRoom.id };
    } else {
      // Odd innocent out - pair them with someone who already has an alibi
      // This creates a 3-person alibi group
      const loneInnocent = shuffledInnocents[i];
      const partnerWithAlibi = shuffledInnocents[0]; // First person already has alibi
      loneInnocent.alibi = {
        withWhom: partnerWithAlibi.id,
        inRoom: partnerWithAlibi.alibi!.inRoom,
      };
    }
  }

  // Murderer has no alibi
  const murderer = npcs.find((npc) => npc.isMurderer);
  if (murderer) {
    murderer.alibi = null;
  }
}

/**
 * Generate clues for all NPCs
 *
 * Clue distribution for solvability:
 * - At least 2 innocents accuse the murderer (corroboration)
 * - At least 1 innocent hints at the murder room
 * - At least 1 innocent hints at the murder weapon + room
 * - Murderer accuses an innocent (red herring)
 */
function generateAllClues(
  npcs: NPC[],
  victim: { name: string; gender: Gender },
  murderer: { name: string; gender: Gender },
  murderRoom: Room,
  murderWeaponName: string
): void {
  const innocents = shuffle(npcs.filter((npc) => !npc.isMurderer));

  // Assign clue roles to different innocents
  // We need: 2+ accusers, 1+ room hinter, 1+ weapon hinter
  const clueAssignments = new Map<string, {
    shouldAccuseMurderer: boolean;
    shouldHintRoom: boolean;
    shouldHintWeapon: boolean;
  }>();

  // Initialize all NPCs with no clue assignments
  npcs.forEach((npc) => {
    clueAssignments.set(npc.id, {
      shouldAccuseMurderer: false,
      shouldHintRoom: false,
      shouldHintWeapon: false,
    });
  });

  // Assign accusers (at least 2 people accuse the murderer)
  if (innocents.length >= 1) {
    clueAssignments.get(innocents[0].id)!.shouldAccuseMurderer = true;
  }
  if (innocents.length >= 2) {
    clueAssignments.get(innocents[1].id)!.shouldAccuseMurderer = true;
  }

  // Assign room hinter (someone saw murderer near the room)
  if (innocents.length >= 3) {
    clueAssignments.get(innocents[2].id)!.shouldHintRoom = true;
  } else if (innocents.length >= 1) {
    // If few innocents, double up on clues
    clueAssignments.get(innocents[0].id)!.shouldHintRoom = true;
  }

  // Assign weapon hinter (someone saw the weapon in the room)
  if (innocents.length >= 4) {
    clueAssignments.get(innocents[3].id)!.shouldHintWeapon = true;
  } else if (innocents.length >= 2) {
    clueAssignments.get(innocents[1].id)!.shouldHintWeapon = true;
  } else if (innocents.length >= 1) {
    clueAssignments.get(innocents[0].id)!.shouldHintWeapon = true;
  }

  // Generate clues for each NPC based on their assignments
  npcs.forEach((npc) => {
    const assignment = clueAssignments.get(npc.id)!;

    npc.clues = generateCluesForNPC({
      npc,
      allNpcs: npcs,
      victim,
      murderer,
      murderRoom,
      murderWeaponName,
      shouldAccuseMurderer: assignment.shouldAccuseMurderer,
      shouldHintRoom: assignment.shouldHintRoom,
      shouldHintWeapon: assignment.shouldHintWeapon,
    });
  });
}

/**
 * Find an NPC by ID
 */
export function findNPC(state: GameState, npcId: string): NPC | undefined {
  return state.npcs.find((npc) => npc.id === npcId);
}

/**
 * Find an item by ID
 */
export function findItem(state: GameState, itemId: string): Item | undefined {
  return state.items.find((item) => item.id === itemId);
}

/**
 * Find a room by ID
 */
export function findRoom(state: GameState, roomId: string): Room | undefined {
  return state.rooms.find((room) => room.id === roomId);
}

/**
 * Get NPCs in a specific room
 */
export function getNPCsInRoom(state: GameState, roomId: string): NPC[] {
  return state.npcs.filter((npc) => npc.currentRoom === roomId);
}

/**
 * Get items in a specific room (that haven't been taken)
 */
export function getItemsInRoom(state: GameState, roomId: string): Item[] {
  return state.items.filter(
    (item) => item.room === roomId && !state.inventory.includes(item.id)
  );
}

/**
 * Check if the player can move to a room from current position
 */
export function canMoveTo(state: GameState, targetRoomId: string): boolean {
  const currentRoom = findRoom(state, state.currentRoom);
  if (!currentRoom) return false;

  return currentRoom.doors.some((door) => door.toRoomId === targetRoomId);
}

/**
 * Check win condition
 */
export function checkWinCondition(
  state: GameState,
  accusedNpcId: string
): 'win' | 'lose' {
  const hasWeapon = state.inventory.includes(state.murderWeapon);
  const inMurderRoom = state.currentRoom === state.murderRoom;
  const accusedMurderer = accusedNpcId === state.murderer;

  if (hasWeapon && inMurderRoom && accusedMurderer) {
    return 'win';
  }
  return 'lose';
}
