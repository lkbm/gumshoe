import { GamePhase } from '../game/types';

interface CommandBarProps {
  selectedEntity: { type: 'npc' | 'item'; id: string } | null;
  selectedName: string | null;
  selectedIcon: string | null;
  hasWeapon: boolean;
  isAssembled: boolean;
  gamePhase: GamePhase;
  onExamine: () => void;
  onTake: () => void;
  onQuestion: () => void;
  onAlibi: () => void;
  onAssemble: () => void;
  onAccuse: () => void;
  onNewGame: () => void;
  onDeselect: () => void;
}

export function CommandBar({
  selectedEntity,
  selectedName,
  selectedIcon,
  hasWeapon,
  isAssembled,
  gamePhase,
  onExamine,
  onTake,
  onQuestion,
  onAlibi,
  onAssemble,
  onAccuse,
  onNewGame,
  onDeselect,
}: CommandBarProps) {
  const isGameOver = gamePhase === 'won' || gamePhase === 'lost';

  if (isGameOver) {
    return (
      <div class="command-bar">
        <button class="cmd-btn cmd-btn-primary" onClick={onNewGame}>
          NEW GAME
        </button>
      </div>
    );
  }

  const isNPCSelected = selectedEntity?.type === 'npc';
  const isItemSelected = selectedEntity?.type === 'item';

  return (
    <div class="command-bar">
      {/* Selected entity display */}
      <div class="selected-display">
        {selectedIcon && <span class="selected-icon">{selectedIcon}</span>}
        {selectedName ?? '\u00A0'}
      </div>

      <div class="cmd-separator" />

      {/* Item commands */}
      <button
        class="cmd-btn"
        disabled={!isItemSelected}
        onClick={onExamine}
      >
        EXAMINE
      </button>
      <button
        class="cmd-btn"
        disabled={!isItemSelected}
        onClick={onTake}
      >
        TAKE
      </button>

      <div class="cmd-separator" />

      {/* NPC commands */}
      <button
        class="cmd-btn"
        disabled={!isNPCSelected}
        onClick={onQuestion}
      >
        QUESTION
      </button>
      <button
        class="cmd-btn"
        disabled={!isNPCSelected}
        onClick={onAlibi}
      >
        ALIBI
      </button>

      <div class="cmd-separator" />

      {/* Endgame commands */}
      <button
        class="cmd-btn"
        disabled={!hasWeapon || isAssembled}
        onClick={onAssemble}
        title={!hasWeapon ? 'Pick up the murder weapon first' : ''}
      >
        ASSEMBLE
      </button>
      <button
        class="cmd-btn cmd-btn-danger"
        disabled={!isAssembled || !isNPCSelected}
        onClick={onAccuse}
        title={!isAssembled ? 'Assemble suspects first' : !isNPCSelected ? 'Select a suspect to accuse' : ''}
      >
        ACCUSE
      </button>

      {selectedEntity && (
        <>
          <div class="cmd-separator" />
          <button class="cmd-btn cmd-btn-secondary" onClick={onDeselect}>
            CANCEL
          </button>
        </>
      )}
    </div>
  );
}
