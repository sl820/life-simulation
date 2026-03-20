import { NextResponse } from 'next/server';
import { getAllScenes, getScenesByCategory } from '@/lib/scenes';

export async function GET() {
  const searchParams = new URLSearchParams();
  // In real usage, would get category from query params

  const scenes = getAllScenes();

  return NextResponse.json({
    scenes: scenes.map((s) => ({
      id: s.id,
      name: s.metadata.name,
      nameEn: s.metadata.nameEn,
      description: s.metadata.description,
      category: s.metadata.category,
      difficulty: s.metadata.difficulty,
      duration: s.metadata.duration,
      tags: s.metadata.tags,
    })),
  });
}
