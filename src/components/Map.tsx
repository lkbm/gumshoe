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
        {/* Render inactive door markers for non-current rooms (deduplicated) */}
        {rooms
          .filter((room) => room.id !== currentRoom)
          .flatMap((room) =>
            room.doors
              // Only render if connecting to a room with lower ID (deduplication)
              .filter((door) => room.id < door.toRoomId)
              .map((door, idx) => (
                <DoorComponent
                  key={`${room.id}-door-${idx}`}
                  door={door}
                  room={room}
                  targetRoom={rooms.find((r) => r.id === door.toRoomId)}
                  isCurrent={false}
                  onMove={onMoveToRoom}
                />
              ))
          )}
        {/* Render active doors for current room (on top) */}
        {rooms
          .find((r) => r.id === currentRoom)
          ?.doors.map((door, idx) => (
            <DoorComponent
              key={`current-door-${idx}`}
              door={door}
              room={rooms.find((r) => r.id === currentRoom)!}
              targetRoom={rooms.find((r) => r.id === door.toRoomId)}
              isCurrent={true}
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

      {/* Only render NPCs and items in current room */}
      {isCurrent && (
        <>
          {/* Render NPCs in room */}
          {npcs.map((npc, idx) => (
            <div
              key={npc.id}
              class={`entity npc ${selectedEntity?.type === 'npc' && selectedEntity.id === npc.id ? 'selected' : ''}`}
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
        </>
      )}

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
  targetRoom: Room | undefined;
  isCurrent: boolean;
  onMove: (roomId: string) => void;
}

function DoorComponent({ door, room, targetRoom, isCurrent, onMove }: DoorComponentProps) {
  // Calculate door position based on the shared edge between rooms
  let left = 0;
  let top = 0;
  let width = 0;
  let height = 0;

  const roomLeft = room.x * GRID_SIZE;
  const roomTop = room.y * GRID_SIZE;
  const roomWidth = room.width * GRID_SIZE;
  const roomHeight = room.height * GRID_SIZE;
  const doorPixelWidth = DOOR_WIDTH * GRID_SIZE;

  // Calculate shared edge for east/west doors (vertical walls)
  const getSharedVerticalEdge = () => {
    if (!targetRoom) return { start: roomTop, length: roomHeight };
    const thisTop = room.y * GRID_SIZE;
    const thisBottom = (room.y + room.height) * GRID_SIZE;
    const otherTop = targetRoom.y * GRID_SIZE;
    const otherBottom = (targetRoom.y + targetRoom.height) * GRID_SIZE;
    const sharedTop = Math.max(thisTop, otherTop);
    const sharedBottom = Math.min(thisBottom, otherBottom);
    return { start: sharedTop, length: sharedBottom - sharedTop };
  };

  // Calculate shared edge for north/south doors (horizontal walls)
  const getSharedHorizontalEdge = () => {
    if (!targetRoom) return { start: roomLeft, length: roomWidth };
    const thisLeft = room.x * GRID_SIZE;
    const thisRight = (room.x + room.width) * GRID_SIZE;
    const otherLeft = targetRoom.x * GRID_SIZE;
    const otherRight = (targetRoom.x + targetRoom.width) * GRID_SIZE;
    const sharedLeft = Math.max(thisLeft, otherLeft);
    const sharedRight = Math.min(thisRight, otherRight);
    return { start: sharedLeft, length: sharedRight - sharedLeft };
  };

  switch (door.direction) {
    case 'north': {
      const shared = getSharedHorizontalEdge();
      left = shared.start + shared.length * door.position - doorPixelWidth / 2;
      top = roomTop - WALL_WIDTH;
      width = doorPixelWidth;
      height = WALL_WIDTH * 3;
      break;
    }
    case 'south': {
      const shared = getSharedHorizontalEdge();
      left = shared.start + shared.length * door.position - doorPixelWidth / 2;
      top = roomTop + roomHeight - WALL_WIDTH;
      width = doorPixelWidth;
      height = WALL_WIDTH * 3;
      break;
    }
    case 'east': {
      const shared = getSharedVerticalEdge();
      left = roomLeft + roomWidth - WALL_WIDTH;
      top = shared.start + shared.length * door.position - doorPixelWidth / 2;
      width = WALL_WIDTH * 3;
      height = doorPixelWidth;
      break;
    }
    case 'west': {
      const shared = getSharedVerticalEdge();
      left = roomLeft - WALL_WIDTH;
      top = shared.start + shared.length * door.position - doorPixelWidth / 2;
      width = WALL_WIDTH * 3;
      height = doorPixelWidth;
      break;
    }
  }

  return (
    <div
      class={`door ${isCurrent ? '' : 'door-inactive'}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={isCurrent ? () => onMove(door.toRoomId) : undefined}
      title={isCurrent ? `Go to ${door.toRoomId}` : undefined}
    >
      <span class="door-arrow">
        {isCurrent ? (
          <>
            {door.direction === 'north' && '▲'}
            {door.direction === 'south' && '▼'}
            {door.direction === 'east' && '▶'}
            {door.direction === 'west' && '◀'}
          </>
        ) : (
          '□'
        )}
      </span>
    </div>
  );
}
