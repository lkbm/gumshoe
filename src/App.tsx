import { useState, useCallback, useMemo, useEffect } from 'preact/hooks';
import { GameState } from './game/types';
import { generateMystery, findNPC, findItem, findRoom } from './game/generator';
import {
  generateQuestionResponse,
  generateAlibiResponse,
  generateExamineResponse,
  generateTakeResponse,
  generateMoveResponse,
  generateAssembleResponse,
  generateWinMessage,
  generateLoseMessage,
} from './game/dialogue';
import { Map } from './components/Map';
import { TextPanel } from './components/TextPanel';
import { CommandBar } from './components/CommandBar';

function createInitialState(): GameState {
  return generateMystery();
}

export function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [debugMode, setDebugMode] = useState(() => window.location.hash === '#debug');

  // Listen for hash changes to toggle debug mode
  useEffect(() => {
    const handleHashChange = () => {
      setDebugMode(window.location.hash === '#debug');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addMessage = useCallback((message: string) => {
    setGameState((state) => ({
      ...state,
      messages: [...state.messages.slice(-20), message], // Keep last 20 messages
    }));
  }, []);

  const handleMoveToRoom = useCallback(
    (roomId: string) => {
      const room = findRoom(gameState, roomId);
      if (room) {
        setGameState((state) => ({
          ...state,
          currentRoom: roomId,
          selectedEntity: null,
          messages: [...state.messages.slice(-20), generateMoveResponse(room.name)],
        }));
      }
    },
    [gameState]
  );

  const handleSelectNPC = useCallback((npcId: string) => {
    setGameState((state) => ({
      ...state,
      selectedEntity: { type: 'npc', id: npcId },
    }));
  }, []);

  const handleSelectItem = useCallback((itemId: string) => {
    setGameState((state) => ({
      ...state,
      selectedEntity: { type: 'item', id: itemId },
    }));
  }, []);

  const handleDeselect = useCallback(() => {
    setGameState((state) => ({
      ...state,
      selectedEntity: null,
    }));
  }, []);

  const handleExamine = useCallback(() => {
    if (gameState.selectedEntity?.type !== 'item') return;

    const item = findItem(gameState, gameState.selectedEntity.id);
    if (item) {
      addMessage(generateExamineResponse(item.name, item.description));
    }
  }, [gameState, addMessage]);

  const handleTake = useCallback(() => {
    if (gameState.selectedEntity?.type !== 'item') return;

    const item = findItem(gameState, gameState.selectedEntity.id);
    if (item && item.canTake) {
      setGameState((state) => ({
        ...state,
        inventory: [...state.inventory, item.id],
        selectedEntity: null,
        messages: [...state.messages.slice(-20), generateTakeResponse(item.name)],
      }));
    }
  }, [gameState]);

  const handleQuestion = useCallback(() => {
    if (gameState.selectedEntity?.type !== 'npc') return;

    const npc = findNPC(gameState, gameState.selectedEntity.id);
    if (npc) {
      addMessage(generateQuestionResponse(npc));
    }
  }, [gameState, addMessage]);

  const handleAlibi = useCallback(() => {
    if (gameState.selectedEntity?.type !== 'npc') return;

    const npc = findNPC(gameState, gameState.selectedEntity.id);
    if (npc) {
      addMessage(generateAlibiResponse(npc, gameState.npcs, gameState.rooms));
    }
  }, [gameState, addMessage]);

  const handleAssemble = useCallback(() => {
    // Move all NPCs to current room
    setGameState((state) => ({
      ...state,
      npcs: state.npcs.map((npc) => ({
        ...npc,
        currentRoom: state.currentRoom,
      })),
      gamePhase: 'assembled',
      messages: [...state.messages.slice(-20), generateAssembleResponse()],
    }));
  }, []);

  const handleAccuse = useCallback(() => {
    if (gameState.selectedEntity?.type !== 'npc') return;
    if (gameState.gamePhase !== 'assembled') return;

    const accusedId = gameState.selectedEntity.id;
    const accusedNpc = findNPC(gameState, accusedId);
    const currentRoom = findRoom(gameState, gameState.currentRoom);
    const weapon = findItem(gameState, gameState.murderWeapon);

    if (!accusedNpc || !currentRoom || !weapon) return;

    // Check if correct
    const isCorrectMurderer = accusedId === gameState.murderer;
    const isCorrectRoom = gameState.currentRoom === gameState.murderRoom;
    const hasWeapon = gameState.inventory.includes(gameState.murderWeapon);

    if (isCorrectMurderer && isCorrectRoom && hasWeapon) {
      setGameState((state) => ({
        ...state,
        gamePhase: 'won',
        messages: [
          ...state.messages.slice(-20),
          generateWinMessage(
            accusedNpc.name,
            state.victim,
            weapon.name,
            currentRoom.name
          ),
        ],
      }));
    } else {
      setGameState((state) => ({
        ...state,
        gamePhase: 'lost',
        messages: [
          ...state.messages.slice(-20),
          generateLoseMessage(accusedNpc.name),
        ],
      }));
    }
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const handleDebug = useCallback(() => {
    const murdererNpc = findNPC(gameState, gameState.murderer);
    const murderRoom = findRoom(gameState, gameState.murderRoom);
    const murderWeapon = findItem(gameState, gameState.murderWeapon);

    const debugMessages = [
      '=== DEBUG INFO ===',
      `Victim: ${gameState.victim}`,
      `Murderer: ${murdererNpc?.name ?? 'Unknown'}`,
      `Murder Room: ${murderRoom?.name ?? 'Unknown'}`,
      `Murder Weapon: ${murderWeapon?.name ?? 'Unknown'}`,
      '==================',
    ];

    setGameState((state) => ({
      ...state,
      messages: [...state.messages.slice(-20), ...debugMessages],
    }));
  }, [gameState]);

  const hasAnyWeapon = useMemo(
    () => gameState.inventory.length > 0,
    [gameState.inventory]
  );

  const isAssembled = gameState.gamePhase === 'assembled';

  return (
    <div class="game-container">
      <header class="game-header">
        <h1>GUMSHOE</h1>
        <div class="inventory">
          Inventory:{' '}
          {gameState.inventory.length === 0
            ? 'Empty'
            : gameState.inventory
              .map((id) => findItem(gameState, id)?.name)
              .filter(Boolean)
              .join(', ')}
        </div>
        {debugMode && (
          <button class="debug-button" onClick={handleDebug}>
            DEBUG
          </button>
        )}
      </header>

      <main class="game-main">
        <Map
          rooms={gameState.rooms}
          currentRoom={gameState.currentRoom}
          npcs={gameState.npcs}
          items={gameState.items}
          inventory={gameState.inventory}
          onMoveToRoom={handleMoveToRoom}
          onSelectNPC={handleSelectNPC}
          onSelectItem={handleSelectItem}
          selectedEntity={gameState.selectedEntity}
        />
      </main>

      <footer class="game-footer">
        <TextPanel messages={gameState.messages} />
        <CommandBar
          selectedEntity={gameState.selectedEntity}
          hasWeapon={hasAnyWeapon}
          isAssembled={isAssembled}
          gamePhase={gameState.gamePhase}
          onExamine={handleExamine}
          onTake={handleTake}
          onQuestion={handleQuestion}
          onAlibi={handleAlibi}
          onAssemble={handleAssemble}
          onAccuse={handleAccuse}
          onNewGame={handleNewGame}
          onDeselect={handleDeselect}
        />
      </footer>
    </div>
  );
}
