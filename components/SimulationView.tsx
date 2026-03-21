'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatusPanel from './StatusPanel';
import TimelineDisplay from './TimelineDisplay';
import DecisionPanel from './DecisionPanel';

interface SimulationState {
  id: string;
  sceneId: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'abandoned';
  currentDate: string;
  position: number;
  protagonist: {
    age: number;
    personality: Record<string, number>;
    skills: string[];
    status: Record<string, number>;
  };
  stats: {
    eventCount: number;
    decisionCount: number;
    a2aInteractionCount: number;
    branchCount: number;
    checkpointCount: number;
  };
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: 'narrative' | 'encounter' | 'challenge' | 'opportunity' | 'milestone' | 'a2a';
  virtualDate: string;
  impact?: Record<string, number>;
  a2aData?: {
    participantIds: string[];
    summary: string;
  };
}

interface DecisionData {
  id: string;
  question: string;
  context: string;
  options: {
    id: string;
    content: string;
    pros?: string[];
    cons?: string[];
    predicted: {
      characterChange: number;
      successProbability: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
  }[];
}

interface SimulationViewProps {
  simulationId: string;
}

export default function SimulationView({ simulationId }: SimulationViewProps) {
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [currentDecision, setCurrentDecision] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulation = useCallback(async () => {
    try {
      const res = await fetch(`/api/simulation/${simulationId}`);
      if (!res.ok) throw new Error('Failed to fetch simulation');
      const data = await res.json();
      setSimulation(data.simulation);
      setEvents(data.events || []);
      setCurrentDecision(data.currentDecision || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [simulationId]);

  useEffect(() => {
    fetchSimulation();
    // Poll for updates when running
    const interval = setInterval(() => {
      if (simulation?.status === 'running') {
        fetchSimulation();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchSimulation, simulation?.status]);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/simulation/${simulationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'running' }),
      });
      await fetchSimulation();
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/simulation/${simulationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      });
      await fetchSimulation();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    setActionLoading(true);
    try {
      await fetch(`/api/simulation/${simulationId}/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed }),
      });
      await fetchSimulation();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (optionId: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/simulation/${simulationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionId: currentDecision?.id, optionId }),
      });
      setCurrentDecision(null);
      await fetchSimulation();
    } finally {
      setActionLoading(false);
    }
  };

  const handleAIAutoDecision = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/simulation/${simulationId}/decision/auto`, {
        method: 'POST',
      });
      setCurrentDecision(null);
      await fetchSimulation();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckpoint = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/simulation/${simulationId}/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `存档 ${new Date().toLocaleString()}` }),
      });
      await fetchSimulation();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <span className="text-4xl">❌</span>
        <p className="mt-2 text-red-600">{error || 'Simulation not found'}</p>
        <Link href="/simulation" className="mt-4 inline-block text-blue-600 hover:underline">
          返回场景选择
        </Link>
      </div>
    );
  }

  const isRunning = simulation.status === 'running';
  const isPaused = simulation.status === 'paused';
  const isDraft = simulation.status === 'draft';
  const isCompleted = simulation.status === 'completed';

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6">
      {/* Left Panel - Status */}
      <div className="w-80 shrink-0 space-y-4 overflow-y-auto">
        <StatusPanel
          age={simulation.protagonist.age}
          personality={simulation.protagonist.personality}
          skills={simulation.protagonist.skills}
          stats={simulation.stats}
          happiness={simulation.protagonist.status.happiness}
        />

        {/* Control Buttons */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">控制</h4>
          <div className="grid grid-cols-2 gap-2">
            {isDraft && (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="col-span-2 rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                ▶ 开始推演
              </button>
            )}
            {isRunning && (
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="col-span-2 rounded-lg bg-yellow-600 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
              >
                ⏸ 暂停
              </button>
            )}
            {isPaused && (
              <>
                <button
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  ▶ 继续
                </button>
                <button
                  onClick={handleCheckpoint}
                  disabled={actionLoading}
                  className="rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  💾 存档
                </button>
              </>
            )}
          </div>

          {/* Speed Control */}
          {(isRunning || isPaused) && (
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <p className="mb-2 text-xs text-zinc-500">时间速度</p>
              <div className="flex gap-1">
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className="flex-1 rounded bg-zinc-100 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {isCompleted && (
            <Link
              href={`/report/${simulationId}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              📊 查看报告
            </Link>
          )}
        </div>
      </div>

      {/* Center Panel - Timeline & Events */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              推演进行中
            </h3>
            <p className="text-sm text-zinc-500">
              {new Date(simulation.currentDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isRunning
                  ? 'bg-green-100 text-green-700'
                  : isPaused
                  ? 'bg-yellow-100 text-yellow-700'
                  : isDraft
                  ? 'bg-zinc-100 text-zinc-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isRunning ? '🔄 运行中' : isPaused ? '⏸ 已暂停' : isDraft ? '📝 待开始' : '✅ 已完成'}
            </span>
          </div>
        </div>

        <TimelineDisplay
          events={events}
          position={simulation.position}
        />
      </div>

      {/* Right Panel - Decision (if any) */}
      {currentDecision && (
        <div className="w-96 shrink-0">
          <DecisionPanel
            decision={currentDecision}
            onSelect={handleDecision}
            onAIAutoSelect={handleAIAutoDecision}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Welcome State */}
      {isDraft && events.length === 0 && (
        <div className="flex-1 rounded-xl border-2 border-dashed border-zinc-300 p-8 text-center dark:border-zinc-600">
          <span className="text-6xl">🎬</span>
          <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">准备开始</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            点击「开始推演」按钮，让你的 Agent 分身开始体验人生
          </p>
          <button
            onClick={handleStart}
            disabled={actionLoading}
            className="mt-6 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? '启动中...' : '▶ 开始推演'}
          </button>
        </div>
      )}
    </div>
  );
}
