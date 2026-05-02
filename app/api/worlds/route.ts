import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function GET() {
  try {
    const worldsIndexPath = path.join(DATA_DIR, 'worlds.json');

    // Check if worlds.json exists
    try {
      await fs.access(worldsIndexPath);
    } catch {
      return NextResponse.json({ worlds: [] });
    }

    const worldsIndexRaw = await fs.readFile(worldsIndexPath, 'utf-8');
    const worldsIndex = JSON.parse(worldsIndexRaw);

    const fullWorlds = await Promise.all(
      worldsIndex.worlds.map(async (w: any) => {
        try {
          const worldDataPath = path.join(DATA_DIR, `world-${w.id}.json`);
          const worldDataRaw = await fs.readFile(worldDataPath, 'utf-8');
          const worldData = JSON.parse(worldDataRaw);

          // In our local data format, world-{id}.json contains the full levels
          return {
            id: worldData.worldId || w.id,
            name: worldData.worldName || w.name,
            levelCount: worldData.levels?.length || 0,
            levels: worldData.levels || [],
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

    return NextResponse.json({ worlds: fullWorlds });
  } catch (error) {
    console.error('Worlds API GET Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { worlds } = await req.json();

    if (!worlds || !Array.isArray(worlds)) {
      return NextResponse.json({ error: 'Invalid worlds data' }, { status: 400 });
    }

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // 1. Prepare and write worlds.json (manifest)
    const worldsIndex = {
      version: '1.0',
      worlds: worlds.map((w) => ({
        id: w.id,
        name: w.name,
        levelCount: w.levels.length,
        levels: w.levels.map((l: any) => ({
          id: l.id,
          name: l.name,
          difficulty: l.difficulty,
          fingerprint: l.fingerprint,
        })),
      })),
    };

    await fs.writeFile(path.join(DATA_DIR, 'worlds.json'), JSON.stringify(worldsIndex, null, 2));

    // 2. Prepare and write each world-{id}.json
    for (const w of worlds) {
      const worldData = {
        worldId: w.id,
        worldName: w.name,
        levels: w.levels.map((level: any) => {
          // Exclude any temporary or play-mode fields if they exist
          // We only save what's in the Level interface
          const {
            // difficulty_score,
            ...rest
          } = level;
          return rest;
        }),
      };

      await fs.writeFile(path.join(DATA_DIR, `world-${w.id}.json`), JSON.stringify(worldData, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Worlds API POST Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
