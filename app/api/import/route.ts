import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { PIECE_SHAPES } from '@/lib/constants';
import { PieceShape } from '@/lib/types';

// Helper to normalize coordinate arrays for comparison
function normalize(cells: [number, number][]): string {
  if (cells.length === 0) return '';
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  return cells
    .map(([r, c]) => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(([r, c]) => `${r},${c}`)
    .join('|');
}

const SHAPE_MAP = new Map<string, PieceShape>();
Object.entries(PIECE_SHAPES).forEach(([name, cells]) => {
  SHAPE_MAP.set(normalize(cells as [number, number][]), name as PieceShape);
});

export async function GET() {
  const outputPath = '/Users/basir/projects/OpticalGrid/olevel-gen/output';

  try {
    const worldsIndexRaw = await fs.readFile(path.join(outputPath, 'worlds.json'), 'utf-8');
    const worldsIndex = JSON.parse(worldsIndexRaw);

    const fullWorlds = await Promise.all(
      worldsIndex.worlds.map(async (w: any) => {
        try {
          const worldDataRaw = await fs.readFile(path.join(outputPath, `world-${w.id}.json`), 'utf-8');
          const worldData = JSON.parse(worldDataRaw);

          const transformedLevels = worldData.levels.map((level: any) => {
            // Map generator level to editor level
            return {
              ...level,
              worldId: w.id,
              levelIndex: level.id,
              id: `${w.id}-${level.id}`,
              move_limit: level.min_moves || 20,
              piece_queue: (level.piece_queue || [])
                .filter((p: any) => !p.is_distractor)
                .map((p: any) => {
                  const norm = normalize(p.shape);
                  const shapeName = SHAPE_MAP.get(norm) || 'Single'; // fallback to Single if unknown
                  return {
                    id: p.id || crypto.randomUUID(),
                    shape: shapeName,
                    count: 1,
                  };
                }),
              grid: level.grid || [], // grid format already matches
              solution_mirrors: (level.solution || [])
                .filter((s: any) => s.piece_id === 'manual_mirror') // adjust if generator uses different markers
                .map((s: any) => ({ row: s.row, col: s.col, type: s.type })),
              solution_path: [], // will be recalculated by editor if needed
              solution_moves: level.solution || [],
              notes: level.mechanic_focus ? `Focus: ${level.mechanic_focus}` : '',
            };
          });

          return {
            id: w.id,
            name: w.name,
            levelCount: transformedLevels.length,
            levels: transformedLevels,
          };
        } catch (e) {
          console.error(`Failed to read world-${w.id}.json`, e);
          return {
            id: w.id,
            name: w.name,
            levelCount: 0,
            levels: [],
          };
        }
      })
    );

    // PERSIST TO LOCAL DATA FOLDER
    const DATA_DIR = path.join(process.cwd(), 'data');
    await fs.mkdir(DATA_DIR, { recursive: true });

    const localWorldsIndex = {
      version: '1.0',
      worlds: fullWorlds.map((w) => ({
        id: w.id,
        name: w.name,
        levelCount: w.levels.length,
        levels: w.levels.map((l: any) => ({
          id: l.id,
          name: l.name,
          difficulty: l.difficulty > 20 ? 'hard' : l.difficulty > 10 ? 'medium' : 'easy',
          difficulty_score: l.difficulty,
        })),
      })),
    };

    await fs.writeFile(path.join(DATA_DIR, 'worlds.json'), JSON.stringify(localWorldsIndex, null, 2));

    for (const w of fullWorlds) {
      const worldData = {
        worldId: w.id,
        worldName: w.name,
        levels: w.levels,
      };
      await fs.writeFile(path.join(DATA_DIR, `world-${w.id}.json`), JSON.stringify(worldData, null, 2));
    }

    return NextResponse.json({ worlds: fullWorlds });
  } catch (error) {
    console.error('Import API Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
