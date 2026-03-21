'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SceneMetadata {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: 'life' | 'career' | 'education' | 'relationship' | 'adventure';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  duration: string;
  tags: string[];
}

interface SceneSelectorProps {
  onSelectScene?: (sceneId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  life: '人生感悟',
  career: '职业发展',
  education: '教育成长',
  relationship: '人际关系',
  adventure: '冒险挑战',
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  easy: { label: '简单', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  medium: { label: '中等', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  hard: { label: '困难', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  very_hard: { label: '极难', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const CATEGORY_ICONS: Record<string, string> = {
  life: '🎭',
  career: '💼',
  education: '🎓',
  relationship: '💕',
  adventure: '🚀',
};

export default function SceneSelector({ onSelectScene }: SceneSelectorProps) {
  const [scenes, setScenes] = useState<SceneMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedScene, setSelectedScene] = useState<SceneMetadata | null>(null);

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      const res = await fetch('/api/scenes');
      const data = await res.json();
      setScenes(data.scenes || []);
    } catch (error) {
      console.error('Failed to fetch scenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScenes = scenes.filter((s) => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  const categories = ['all', ...Array.from(new Set(scenes.map((s) => s.category)))];

  const handleSelectScene = (scene: SceneMetadata) => {
    setSelectedScene(scene);
  };

  const handleStartSimulation = () => {
    if (selectedScene && onSelectScene) {
      onSelectScene(selectedScene.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {cat === 'all' ? '全部场景' : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Scene Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredScenes.map((scene) => {
          const difficulty = DIFFICULTY_CONFIG[scene.difficulty] || DIFFICULTY_CONFIG.medium;
          const isSelected = selectedScene?.id === scene.id;

          return (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(scene)}
              className={`group relative rounded-2xl border-2 p-5 text-left transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20'
                  : 'border-zinc-200 bg-white hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-blue-600'
              }`}
            >
              {/* Category Icon */}
              <div className="mb-3 text-3xl">{CATEGORY_ICONS[scene.category] || '🎮'}</div>

              {/* Title */}
              <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {scene.name}
              </h3>
              <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{scene.nameEn}</p>

              {/* Description */}
              <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
                {scene.description}
              </p>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-1">
                {scene.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficulty.bgColor} ${difficulty.color}`}
                >
                  {difficulty.label}
                </span>
                <span className="text-xs text-zinc-500">{scene.duration}</span>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Scene Detail & Action */}
      {selectedScene && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                已选择: {selectedScene.name}
              </h4>
              <p className="text-sm text-zinc-500">{selectedScene.description}</p>
            </div>
            <div className="ml-4 flex gap-3">
              <button
                onClick={() => setSelectedScene(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                取消
              </button>
              {onSelectScene ? (
                <button
                  onClick={handleStartSimulation}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  开始推演
                </button>
              ) : (
                <Link
                  href={`/simulation?scene=${selectedScene.id}`}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  开始推演
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredScenes.length === 0 && (
        <div className="py-16 text-center">
          <div className="mb-4 text-5xl">🎮</div>
          <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">暂无场景</h3>
          <p className="text-sm text-zinc-500">该分类下暂无可用场景</p>
        </div>
      )}
    </div>
  );
}
