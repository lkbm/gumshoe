import { Room, NPC, Item, Door } from '../game/types';
import { useRef, useEffect, useState } from 'preact/hooks';

interface MapProps {
  rooms: Room[];
  currentRoom: string;
  npcs: NPC[];
  items: Item[];
  inventory: string[];
  onMoveToRoom: (roomId: string) => void;
  onSelectNPC: (npcId: string) => void;
  onSelectItem: (itemId: string) => void;
  selectedEntity: { type: 'npc' | 'item'; id: string } | null;
}

// Grid unit size in pixels (base size before scaling)
const GRID_SIZE = 50;
// Wall thickness in pixels
const WALL_WIDTH = 6;
// Door width in grid units (fraction of wall)
const DOOR_WIDTH = 0.4;

export function Map({
  rooms,
  currentRoom,
  npcs,
  items,
  inventory,
  onMoveToRoom,
  onSelectNPC,
  onSelectItem,
  selectedEntity,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculate map dimensions
  const maxX = Math.max(...rooms.map((r) => r.x + r.width));
  const maxY = Math.max(...rooms.map((r) => r.y + r.height));
  const mapWidth = maxX * GRID_SIZE + WALL_WIDTH;
  const mapHeight = maxY * GRID_SIZE + WALL_WIDTH;

  // Calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate scale to fit, with some padding
      const scaleX = (containerWidth - 20) / mapWidth;
      const scaleY = (containerHeight - 20) / mapHeight;
      const newScale = Math.min(scaleX, scaleY, 2); // Cap at 2x to avoid being too large

      setScale(Math.max(0.5, newScale)); // Minimum 0.5x scale
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [mapWidth, mapHeight]);

  const currentRoomData = rooms.find((r) => r.id === currentRoom);

  return (
    <div class="map-container" ref={containerRef}>
      <div
        class="map"
        style={{
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          position: 'relative',
          transform: `scale(${scale})`,
        }}
      >
        {rooms.map((room) => (
          <RoomComponent
            key={room.id}
            room={room}
            isCurrent={room.id === currentRoom}
            npcs={npcs.filter((npc) => npc.currentRoom === room.id)}
            items={items.filter(
              (item) => item.room === room.id && !inventory.includes(item.id)
            )}
            onSelectNPC={onSelectNPC}
            onSelectItem={onSelectItem}
            selectedEntity={selectedEntity}
          />
        ))}
        {/* Render doors separately so they're clickable */}
        {currentRoomData?.doors.map((door, idx) => (
          <DoorComponent
            key={`${currentRoom}-door-${idx}`}
            door={door}
            room={currentRoomData}
            onMove={onMoveToRoom}
          />
        ))}
      </div>
    </div>
  );
}

interface RoomComponentProps {
  room: Room;
  isCurrent: boolean;
  npcs: NPC[];
  items: Item[];
  onSelectNPC: (npcId: string) => void;
  onSelectItem: (itemId: string) => void;
  selectedEntity: { type: 'npc' | 'item'; id: string } | null;
}

function RoomComponent({
  room,
  isCurrent,
  npcs,
  items,
  onSelectNPC,
  onSelectItem,
  selectedEntity,
}: RoomComponentProps) {
  const style = {
    left: `${room.x * GRID_SIZE}px`,
    top: `${room.y * GRID_SIZE}px`,
    width: `${room.width * GRID_SIZE}px`,
    height: `${room.height * GRID_SIZE}px`,
  };

  return (
    <div
      class={`room ${isCurrent ? 'room-current' : ''}`}
      style={style}
    >
      <span class="room-name">{room.name}</span>

      {/* Render NPCs in room */}
      {npcs.map((npc, idx) => (
        <div
          key={npc.id}
          class={`entity npc ${selectedEntity?.type === 'npc' && selectedEntity.id === npc.id ? 'selected' : ''} ${npc.isMurderer ? '' : ''}`}
          style={{
            left: `${20 + (idx % 3) * 30}px`,
            top: `${30 + Math.floor(idx / 3) * 30}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectNPC(npc.id);
          }}
          title={npc.name}
        >
          <span class="entity-icon">☺</span>
          <span class="entity-name">{npc.name}</span>
        </div>
      ))}

      {/* Render items in room */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          class={`entity item ${selectedEntity?.type === 'item' && selectedEntity.id === item.id ? 'selected' : ''}`}
          style={{
            right: `${10 + (idx % 2) * 25}px`,
            bottom: `${10 + Math.floor(idx / 2) * 25}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          title={item.name}
        >
          <span class="entity-icon">{item.icon}</span>
        </div>
      ))}

      {/* Player indicator */}
      {isCurrent && (
        <div class="player">
          <span class="player-icon">☻</span>
        </div>
      )}
    </div>
  );
}

interface DoorComponentProps {
  door: Door;
  room: Room;
  onMove: (roomId: string) => void;
}

function DoorComponent({ door, room, onMove }: DoorComponentProps) {
  // Calculate door position based on direction
  let left = 0;
  let top = 0;
  let width = 0;
  let height = 0;

  const roomLeft = room.x * GRID_SIZE;
  const roomTop = room.y * GRID_SIZE;
  const roomWidth = room.width * GRID_SIZE;
  const roomHeight = room.height * GRID_SIZE;
  const doorPixelWidth = DOOR_WIDTH * GRID_SIZE;

  switch (door.direction) {
    case 'north':
      left = roomLeft + roomWidth * door.position - doorPixelWidth / 2;
      top = roomTop - WALL_WIDTH;
      width = doorPixelWidth;
      height = WALL_WIDTH * 3;
      break;
    case 'south':
      left = roomLeft + roomWidth * door.position - doorPixelWidth / 2;
      top = roomTop + roomHeight - WALL_WIDTH;
      width = doorPixelWidth;
      height = WALL_WIDTH * 3;
      break;
    case 'east':
      left = roomLeft + roomWidth - WALL_WIDTH;
      top = roomTop + roomHeight * door.position - doorPixelWidth / 2;
      width = WALL_WIDTH * 3;
      height = doorPixelWidth;
      break;
    case 'west':
      left = roomLeft - WALL_WIDTH;
      top = roomTop + roomHeight * door.position - doorPixelWidth / 2;
      width = WALL_WIDTH * 3;
      height = doorPixelWidth;
      break;
  }

  return (
    <div
      class="door"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={() => onMove(door.toRoomId)}
      title={`Go to ${door.toRoomId}`}
    >
      <span class="door-arrow">
        {door.direction === 'north' && '▲'}
        {door.direction === 'south' && '▼'}
        {door.direction === 'east' && '▶'}
        {door.direction === 'west' && '◀'}
      </span>
    </div>
  );
}
