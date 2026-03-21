'use client';

import Link from 'next/link';
import { AnalysisReport } from '@/lib/analysis/types';
import LifeGraph from './LifeGraph';

interface ReportViewProps {
  report: AnalysisReport;
  simulationId: string;
}

export default function ReportView({ report, simulationId }: ReportViewProps) {
  const { meta, visualizations, insights, recommendations } = report;
  const branchTree = visualizations.branchTree;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/simulation" className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              人生推演引擎
            </Link>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              📊 分析报告
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Meta Info */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{meta.sceneName}</h1>
            <div className="flex gap-2">
              <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                📤 分享
              </button>
              <Link
                href="/simulation"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                🔄 再来一次
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-700">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="text-xs text-zinc-500">推演时长</div>
                <div className="font-medium">{meta.duration} 分钟</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-700">
              <span className="text-2xl">🌿</span>
              <div>
                <div className="text-xs text-zinc-500">分支数</div>
                <div className="font-medium">{meta.branchCount} 条</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-700">
              <span className="text-2xl">📅</span>
              <div>
                <div className="text-xs text-zinc-500">事件数</div>
                <div className="font-medium">{meta.eventCount} 个</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-700">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="text-xs text-zinc-500">A2A交互</div>
                <div className="font-medium">{meta.a2aInteractionCount} 次</div>
              </div>
            </div>
          </div>
        </div>

        {/* Life Graph */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            🌳 人生图谱
          </h2>
          <LifeGraph
            branches={branchTree.branches.map((b) => ({
              id: b.id,
              parentId: b.parentId,
              label: b.label || '初始分支',
              decisionQuestion: b.decisionQuestion,
              chosenOption: b.chosenOption,
              outcome: b.outcome,
              eventCount: b.eventCount,
              stats: {
                finalHappiness: b.stats?.finalHappiness,
                finalCharacter: b.stats?.finalCharacter,
              },
            }))}
            rootId={branchTree.rootId}
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personality Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              🧠 性格变化
            </h2>
            <div className="space-y-3">
              {visualizations.personalityChart.changes.map((change) => (
                <div key={change.trait} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{change.trait}</span>
                    <span className={`font-medium ${change.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change.change >= 0 ? '+' : ''}{change.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className={`h-full rounded-full ${change.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(change.after * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-zinc-50 p-2 dark:bg-zinc-700/50">
                <span className="text-zinc-500">最显著成长：</span>
                <span className="font-medium">{insights.personality.mostChangedTrait}</span>
              </div>
              <div className="rounded bg-zinc-50 p-2 dark:bg-zinc-700/50">
                <span className="text-zinc-500">稳定度：</span>
                <span className="font-medium">{(insights.personality.stabilityScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Decision Analysis */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              🎯 决策分析
            </h2>
            <div className="mb-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{insights.decision.totalDecisions}</div>
                <div className="text-xs text-zinc-500">总决策</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(insights.decision.successRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-zinc-500">成功率</div>
              </div>
            </div>
            {insights.decision.keyPatterns.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-1 text-sm font-medium text-green-600">✅ 优势</h3>
                <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {insights.decision.keyPatterns.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {insights.decision.avoidPatterns.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-amber-600">⚠️ 注意</h3>
                <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {insights.decision.avoidPatterns.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* A2A Interactions */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              🤝 A2A社交网络
            </h2>
            <div className="mb-4 text-center">
              <div className="text-4xl font-bold text-purple-600">{insights.a2a.totalInteractions}</div>
              <div className="text-sm text-zinc-500">次交互</div>
            </div>
            {visualizations.a2aNetwork.nodes.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {visualizations.a2aNetwork.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm dark:bg-purple-900/30"
                  >
                    <span>{node.type === 'historical' ? '🏛️' : '👤'}</span>
                    <span>{node.name}</span>
                    <span className="text-xs text-purple-600">{node.interactionCount}次</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-500">暂无A2A交互记录</p>
            )}
          </div>

          {/* Knowledge & Skills */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              📚 知识获取
            </h2>
            {insights.knowledge.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.knowledge.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-500">暂无知识获取记录</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            💡 决策建议
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                🎯 短期（1-3年）
              </h3>
              <ul className="space-y-1 text-sm text-blue-600">
                {recommendations.shortTerm.map((r, i) => (
                  <li key={i}>→ {r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-700">
                🎓 中期（5-10年）
              </h3>
              <ul className="space-y-1 text-sm text-purple-600">
                {recommendations.mediumTerm.map((r, i) => (
                  <li key={i}>→ {r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700">
                🚀 长期（20年+）
              </h3>
              <ul className="space-y-1 text-sm text-amber-600">
                {recommendations.longTerm.map((r, i) => (
                  <li key={i}>→ {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/simulation"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            🔄 再来一次
          </Link>
          <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
            📤 分享报告
          </button>
        </div>
      </main>
    </div>
  );
}
