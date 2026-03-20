import { Scene, BUILT_IN_SCENES } from './types';

const sceneRegistry = new Map<string, Scene>();

// Initialize with built-in scenes
BUILT_IN_SCENES.forEach((scene) => {
  sceneRegistry.set(scene.id, scene);
});

export function getScene(sceneId: string): Scene | undefined {
  return sceneRegistry.get(sceneId);
}

export function getAllScenes(): Scene[] {
  return Array.from(sceneRegistry.values());
}

export function getScenesByCategory(category: Scene['metadata']['category']): Scene[] {
  return getAllScenes().filter((s) => s.metadata.category === category);
}

export function registerScene(scene: Scene): void {
  sceneRegistry.set(scene.id, scene);
}

export function getSceneMetadata(sceneId: string) {
  const scene = getScene(sceneId);
  return scene?.metadata ?? null;
}

export function getSceneConfig(sceneId: string) {
  const scene = getScene(sceneId);
  if (!scene) return null;
  return {
    time: scene.time,
    characters: scene.characters,
    constraints: scene.characters.protagonist.constraints,
  };
}
