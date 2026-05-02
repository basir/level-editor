import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { PIECE_SHAPES, SHAPE_COLORS } from '@/lib/constants';

export async function POST() {
  const targetPath = '/Users/basir/projects/OpticalGrid/optical-grid/assets/data';
  const DATA_DIR = path.join(process.cwd(), 'data');

  try {
    const localWorldsManifestRaw = await fs.readFile(path.join(DATA_DIR, 'worlds.json'), 'utf-8');
    const localWorldsManifest = JSON.parse(localWorldsManifestRaw);

    const worlds = await Promise.all(
      localWorldsManifest.worlds.map(async (w: any) => {
        const worldDataRaw = await fs.readFile(path.join(DATA_DIR, `world-${w.id}.json`), 'utf-8');
        const worldData = JSON.parse(worldDataRaw);
        return {
          id: w.id,
          name: w.name,
          levels: worldData.levels,
        };
      })
    );

    // 1. Prepare and write worlds.json
    const worldsIndex = {
      version: '1.0',
      worlds: worlds.map((w) => ({
        id: w.id,
        name: w.name,
        desc: w.desc || `World ${w.id}: ${w.name}. Classic block puzzle mechanics.`,
        level_count: w.levels.length,
        levels: w.levels.map((l: any) => ({
          id: l.id,
          name: l.name,
          difficulty: l.difficulty > 20 ? 'hard' : l.difficulty > 10 ? 'medium' : 'easy',
          fingerprint: l.fingerprint,
        })),
      })),
    };

    await fs.writeFile(path.join(targetPath, 'worlds.json'), JSON.stringify(worldsIndex, null, 2));

    // 2. Prepare and write each world-{id}.json
    for (const w of worlds) {
      const worldData = {
        version: '1.0',
        id: w.id,
        name: w.name,
        desc: w.desc || `World ${w.id}: ${w.name}. Classic block puzzle mechanics.`,
        levels: w.levels.map((level: any) => {
          // Reverse transformation
          const {
            worldId,
            id,
            move_limit,
            piece_queue,
            grid,
            difficulty_score,
            ...rest
          } = level;

          return {
            ...rest,
            id: level.id,
            name: level.name,
            world: w.id,
            min_moves: move_limit,
            piece_queue: (piece_queue || []).map((p: any) => ({
              id: p.id,
              shape: PIECE_SHAPES[p.shape as keyof typeof PIECE_SHAPES] || [[0, 0]],
              color: SHAPE_COLORS[p.shape as keyof typeof SHAPE_COLORS] || "#8AC926",
              label: p.shape, // fallback to shape name as label
              is_distractor: false,
            })),
            grid: grid,
          };
        }),
      };

      await fs.writeFile(path.join(targetPath, `world-${w.id}.json`), JSON.stringify(worldData, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
