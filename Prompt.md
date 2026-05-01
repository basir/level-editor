Update level editor as follow:
# Prompt: Update The Optical Grid Level Editor — Post-Original Changes

## Context

You have an existing Next.js 14 level editor built from a previous prompt. This prompt contains every change made to the game design since that editor was built. Apply all changes listed below. Do not rebuild from scratch — update the existing codebase.

---

## Change 1 — Mirror Reflection Rules Corrected

The original prompt had mirrors reflecting 4 directions each. This was wrong. Each mirror now reflects **exactly 2 directions** and **blocks all others**. A beam hitting a mirror from a blocked direction stops at that cell exactly like hitting a stone.

**Update `MIRROR_REFLECT` in `/lib/laser.ts`:**

```
"dr": left→down, up→right // others blocked
"dl": right→down, up→left // others blocked
"ur": left→up, down→right // others blocked
"ul": right→up, down→left // others blocked
```

**Update `traceLaser` mirror handling — beam from blocked direction stops immediately:**

```typescript
if (cell && typeof cell === 'object' && cell.type === 'mirror') {
  const dirIn = dirFromVec(dr, dc)
  const reflect = MIRROR_REFLECT[cell.mirror]
  const dirOut = reflect?.[dirIn]
  if (!dirOut) break  // blocked direction — beam stops here, same as stone
  ;[dr, dc] = DIR_VEC[dirOut]
}
```

## Change 2 — Mirrors Are Pre-placed by Designer, Never in Player Queue

The original editor included mirror piece types (`mirror_dr`, `mirror_ur`, `mirror_dl`, `mirror_ul`) in the piece queue builder. **Remove these entirely from the queue.**

Mirrors are now always pre-placed by the designer directly on the grid using the paint tools. They are never player-placed pieces.

**Changes required:**

- Remove `mirror_dr`, `mirror_ur`, `mirror_dl`, `mirror_ul` from `PIECE_CELLS` constant
- Remove mirror piece types from the "Add piece" dialog/popover in `PieceQueue.tsx`
- Remove mirror piece types from `PieceShape` type union in `/lib/types.ts`
- Keep the mirror paint tools in the Toolbar — the designer still paints mirrors onto the grid directly (this is unchanged)
- The `piece_queue` in exported JSON must never contain mirror entries

---

## Change 3 — JSON Schema Updated

The JSON schema changed significantly. Update all export/import logic in `/lib/export.ts` and the TypeScript types in `/lib/types.ts`.

### `worlds.json` — simplified, remove unused fields

```json
{
  "version": "1.0",
  "worlds": [
    {
      "id": 1,
      "name": "First Light",
      "levelCount": 10,
      "levels": [
        {
          "id": 1,
          "name": "First Steps",
          "difficulty": "easy",
          "difficulty_score": 1
        },
        ...]
    }
  ]
}
```

Remove `theme` and `unlockedMechanics` fields — they are no longer part of the schema.

### `world-{id}.json` — level schema updated

```json
{
  "worldId": 1,
  "worldName": "First Light",
  "levels": [
    {
      "id": "1-1",
      "worldId": 1,
      "levelIndex": 1,
      "name": "Level 1-1",
      "grid": [...],
      "solution_mirrors": [
        {"row": 2, "col": 3, "type": "dr"}
      ],
      "solution_path": [[0,0],[0,1],...,[9,9]],
      "solution_moves": [
        {"step": 1, "piece_id": "q1", "shape": "i3_h", "row": 6, "col": 1},
        {"step": 2, "piece_id": "q2", "shape": "dot",  "row": 0, "col": 2}
      ],
      "alt_paths": [
        {
          "mirrors": [{"row": 2, "col": 6, "type": "dr"}],
          "path": [[0,0],...,[9,9]]
        }
      ],
      "piece_queue": [
        {"id": "q1", "shape": "i3_h", "count": 2},
        {"id": "q2", "shape": "dot",  "count": 1}
      ],
      "move_limit": 3,
      "difficulty": 12,
      "generation_log": {},
      "optic_unsolved": false,
      "notes": ""
    }
  ]
}
```

**Key schema differences from the original:**

- `source` and `target` are no longer separate top-level fields — they are embedded in the `grid` array as `{"type":"source"}` and `{"type":"target"}` at fixed positions `(0,0)` and `(9,9)` respectively
- `laserStartDir` removed — laser always starts firing right, always from `(0,0)`
- `moveLimit` renamed to `move_limit` (snake_case throughout)
- `pieceQueue` renamed to `piece_queue`
- `solutionMirrors` renamed to `solution_mirrors`
- `solutionPath` renamed to `solution_path`
- `fogCells` and `prefillCells` removed as top-level fields — fog and prefill cells are embedded directly in the `grid` array
- Added `solution_moves` — array of step-by-step placement moves (see Change 7)
- Added `alt_paths` — optional alternative laser routes (metadata only, not used by editor logic)
- Added `difficulty` — integer, count of filled cells at level start
- Added `generation_log` — passthrough metadata from generator, editor displays read-only
- Added `optic_unsolved` — boolean flag, editor displays warning if true

### Grid cell values — updated

```typescript
type GridCell =
  | null                                          // empty
  | 'hole'                                        // permanent hole
  | { type: 'source' }                            // always at (0,0)
  | { type: 'stone' }                             // stone block
  | { type: 'frozen' }                            // frozen block (become stone on first clear and remove on second clear)
  | { type: 'target' }                            // always at (9,9)
  | { type: 'mirror'; mirror: 'dr'|'dl'|'ul'|'ur' }
  | { type: 'fog'; reveals: 'stone' | 'hole' }
```

Note: `source` is always at `(0,0)` and `target` always at `(9,9)`. The editor must:
- Initialize every new level with source at `(0,0)` and target at `(9,9)` pre-placed
- Prevent the designer from erasing or overwriting source and target cells
- Never allow any other tool to paint over `(0,0)` or `(9,9)`

---

## Change 4 — Line Clear Rule: Segment-Based

The original editor described lines clearing when "every non-hole cell is filled." This was wrong. **Update all documentation, tooltips, and validation logic.**

### New rule

Every row and column is divided into **independent segments** by permanent cells. Both **mirrors AND holes** act as dividers — along with source and target. A segment clears when all cells within it are filled. Other segments in the same line are unaffected.

```
Row with mirror at col 3, hole at col 6:
col:  0   1   2  [◢]  4   5  [○]  7   8   9
seg:  ←── seg A ──→       ← B →       ←── seg C ──→

Filling seg A → only cols 0,1,2 clear. Mirror and hole stay. Segs B and C untouched.
```

### Mirror removal on segment clear

When a segment fully fills and clears, **every mirror that directly borders that segment is also removed**. Holes, source, and target are never removed.

A mirror borders a segment if it is the immediate permanent cell before the first cell or after the last cell of the segment within the line.

### Implementation in `/lib/laser.ts` — add segment utilities

```typescript
const PERMANENT = new Set(['mirror', 'hole', 'source', 'target'])

export function getSegments(lineCells: [number,number][], grid: GridCell[][]): [number,number][][] {
  const segments: [number,number][][] = []
  let current: [number,number][] = []

  for (const [r, c] of lineCells) {
    const cell  = grid[r][c]
    const ctype = typeof cell === 'object' && cell ? cell.type : (cell ?? 'empty')
    if (PERMANENT.has(ctype as string)) {
      if (current.length) { segments.push(current); current = [] }
    } else {
      current.push([r, c])
    }
  }
  if (current.length) segments.push(current)
  return segments.filter(s => s.length > 0)
}

export function segmentIsComplete(segment: [number,number][], grid: GridCell[][]): boolean {
  return segment.every(([r, c]) => grid[r][c] !== null && grid[r][c] !== undefined)
}

export function getBorderingMirrors(
  segment: [number,number][],
  lineCells: [number,number][],
  grid: GridCell[][]
): [number,number][] {
  const segSet  = new Set(segment.map(([r,c]) => `${r},${c}`))
  const result: [number,number][] = []
  const added   = new Set<string>()

  for (let i = 0; i < lineCells.length; i++) {
    const [r, c] = lineCells[i]
    if (!segSet.has(`${r},${c}`)) continue
    for (const ni of [i - 1, i + 1]) {
      if (ni < 0 || ni >= lineCells.length) continue
      const [nr, nc] = lineCells[ni]
      const key = `${nr},${nc}`
      if (!segSet.has(key) && !added.has(key)) {
        const ncell  = grid[nr][nc]
        const nctype = typeof ncell === 'object' && ncell ? ncell.type : ncell
        if (nctype === 'mirror') { result.push([nr, nc]); added.add(key) }
      }
    }
  }
  return result
}
```

### Update `findTrapMirrors` in `/lib/laser.ts`

The original trap detection scanned whole lines. Update it to work per-segment — a mirror is in a trap when its **adjacent segment** has exactly 1 empty cell remaining, not the whole line.

```typescript
export function findTrapMirrors(grid: GridCell[][]): Set<string> {
  const danger = new Set<string>()

  for (let r = 0; r < 10; r++) {
    const line = Array.from({length:10}, (_,c): [number,number] => [r,c])
    const segs  = getSegments(line, grid)
    for (const seg of segs) {
      const empty = seg.filter(([r2,c2]) => grid[r2][c2] === null).length
      if (empty !== 1) continue
      // This segment is a trap — find bordering mirrors
      for (const [mr,mc] of getBorderingMirrors(seg, line, grid)) {
        danger.add(`${mr},${mc}`)
      }
    }
  }

  for (let c = 0; c < 10; c++) {
    const line = Array.from({length:10}, (_,r): [number,number] => [r,c])
    const segs  = getSegments(line, grid)
    for (const seg of segs) {
      const empty = seg.filter(([r2,c2]) => grid[r2][c2] === null).length
      if (empty !== 1) continue
      for (const [mr,mc] of getBorderingMirrors(seg, line, grid)) {
        danger.add(`${mr},${mc}`)
      }
    }
  }

  return danger
}
```

### Update `TrapWarning.tsx`

Update the warning message to reflect the segment-based rule:

```
⚠ Trap Segments: 2
Mirror at (3,4) — adjacent segment in row 3 has 1 empty cell
Mirror at (7,7) — adjacent segment in col 7 has 1 empty cell
```

---

## Change 6 — Updated JSON Import Handling

When importing a JSON file generated by the Python generator, the editor must handle all new fields gracefully:

- `solution` — display read-only in a new "Solution" panel (see Change 7)
- `alt_paths` — display read-only, count shown in ValidationPanel
- `generation_log` — display read-only in a collapsible "Generation Info" section in LevelMeta
- `difficulty` — display read-only next to move_limit
- `optic_unsolved: true` — show a prominent warning banner above the grid: "⚠ This level has no valid laser solution. Edit to fix."

Fields the editor does not recognize should be preserved on import and re-exported unchanged (pass-through unknown fields).

---

## Change 7 — New: Solution Panel

Add a new read-only panel in the right sidebar: **Solution**.

This panel displays the `solution` array imported from the generator. It is read-only in the editor — the editor does not compute solution moves, it only displays them from the imported JSON.

```
      "solution": [
        {
          "step": 1,
          "piece_id": "p1",
          "row": 4,
          "col": 1
        }
      ],
...

[No solution recorded]  ← shown when solution_moves is empty or missing
```

Hovering a step highlights the affected cells on the grid (faint yellow overlay on the cells that piece would occupy). Clicking a step also highlights it persistently until clicked again.

The panel collapses by default — use shadcn `Collapsible`. Add it below the Validation Panel in the right sidebar.

---

## Change 8 — Queue Size Cap

The piece queue is capped at **6 pieces maximum** across all worlds. This is a hard cap — the queue builder must enforce it.

**Update `PieceQueue.tsx`:**
- Show a piece count indicator: "3 / 6 pieces"
- Disable the "Add piece" button when count reaches 6
- Show a tooltip: "Maximum 6 pieces per level"
- The count is the total number of queue entries (each `{id, shape, count}` object counts as 1 entry regardless of its count value)

---

## Change 9 — Validation Panel Updates

Update `ValidationPanel.tsx` to reflect the new game logic:

```
Laser:          ● REACHES TARGET  /  ○ BLOCKED AT (r,c)
Mirrors placed: 2
Trap segments:  1  ⚠          ← was "Trap mirrors", now segment-based
Alt paths:      1              ← count from alt_paths field if imported
Queue size:     4 / 6
Move limit:     3
Difficulty:     12             ← filled cell count, read-only from import
optic_unsolved: false          ← shown only if true, as warning
```

Remove "Stones on path" — this was a generator concept, not relevant in the editor.

---

## Change 10 — Source and Target Always Fixed

In the original spec, source and target were configurable (designer could set them anywhere). **They are now always fixed:**

- Source: always `(0,0)`
- Target: always `(9,9)`
- Laser always starts firing right

**Changes:**
- Remove `setSource` and `setTarget` actions from the Zustand store
- Remove `Source` and `Target` tools from the Toolbar
- Remove `laserStartDir` from all types and exports
- Every new level initializes with `grid[0][0] = {type:'source'}` and `grid[9][9] = {type:'target'}` automatically
- These cells render with their respective icons but have no paint interaction — clicking them does nothing
- The `S` and `T` keyboard shortcuts should be removed or reassigned

---

## What NOT to Change

- Dark theme visual design — unchanged
- shadcn/ui component choices — unchanged
- Zustand + localStorage persistence — unchanged
- Undo/redo system — unchanged
- Keyboard shortcuts (except S and T removed per Change 10)
- Drag-to-paint behavior — unchanged
- World/level tree in left sidebar — unchanged
- Export to zip functionality — unchanged
- Fog and prefill cell tools in Toolbar — unchanged (still available for future worlds)
- `PIECE_CELLS` shape definitions for all non-mirror pieces — unchanged

---

## Implementation Order

1. Update `MIRROR_REFLECT` in `laser.ts` and verify tracer still works correctly with a known grid
2. Add `getSegments`, `segmentIsComplete`, `getBorderingMirrors` to `laser.ts`
3. Update `findTrapMirrors` to segment-based logic
4. Update `GridCell` type and all related types in `types.ts`
5. Fix source/target: hardcode to `(0,0)` and `(9,9)`, remove set tools
6. Remove mirror pieces from queue builder
7. Enforce 6-piece queue cap in `PieceQueue.tsx`
8. Update JSON export schema in `export.ts`
9. Update JSON import to handle new fields and pass through unknowns
10. Replace `LaserBeam.tsx` with continuous glow renderer
11. Update `TrapWarning.tsx` to segment-based messages
12. Update `ValidationPanel.tsx` with new fields
13. Add Solution panel (read-only, collapsible)
14. Add `optic_unsolved` warning banner
15. Update all tooltips and help text referencing mirror rules or line-clear rules
