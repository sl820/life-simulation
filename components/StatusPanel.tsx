'use client';

interface PersonalityTrait {
  name: string;
  value: number;
  icon: string;
}

interface StatusPanelProps {
  age: number;
  personality: Record<string, number>;
  skills: string[];
  stats: {
    eventCount: number;
    decisionCount: number;
    a2aInteractionCount: number;
    branchCount: number;
    checkpointCount: number;
  };
  happiness?: number;
}

const TRAIT_CONFIG: Record<string, { name: string; icon: string }> = {
  openness: { name: '开放性', icon: '🧠' },
  conscientiousness: { name: '尽责性', icon: '📋' },
  extraversion: { name: '外向性', icon: '💬' },
  agreeableness: { name: '宜人性', icon: '🤝' },
  neuroticism: { name: '神经质', icon: '😰' },
  riskTolerance: { name: '风险承受', icon: '🎲' },
};

export default function StatusPanel({ age, personality, skills, stats, happiness = 0.6 }: StatusPanelProps) {
  const traits: PersonalityTrait[] = Object.entries(personality)
    .filter(([key]) => TRAIT_CONFIG[key])
    .map(([key, value]) => ({
      name: TRAIT_CONFIG[key]?.name || key,
      value,
      icon: TRAIT_CONFIG[key]?.icon || '❓',
    }));

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      {/* Age & Happiness */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{age}岁</div>
            <div className="text-xs text-zinc-500">当前年龄</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">😊</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.round(happiness * 100)}%
            </div>
            <div className="text-xs text-zinc-500">幸福感</div>
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">性格特质</h4>
        <div className="space-y-2">
          {traits.map((trait) => (
            <div key={trait.name} className="flex items-center gap-2">
              <span className="w-5 text-sm">{trait.icon}</span>
              <span className="w-16 text-xs text-zinc-600 dark:text-zinc-400">{trait.name}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${trait.value * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-zinc-500">
                {Math.round(trait.value * 100)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">技能</h4>
        <div className="flex flex-wrap gap-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{stats.eventCount}</div>
          <div className="text-xs text-zinc-500">事件</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{stats.decisionCount}</div>
          <div className="text-xs text-zinc-500">决策</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{stats.a2aInteractionCount}</div>
          <div className="text-xs text-zinc-500">A2A交互</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {stats.checkpointCount}/5
          </div>
          <div className="text-xs text-zinc-500">存档</div>
        </div>
      </div>
    </div>
  );
}
