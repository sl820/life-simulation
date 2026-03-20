'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'historical' | 'system';
  aboutMe?: string;
  status: string;
}

interface AgentListProps {
  onSelectAgent: (agent: Agent) => void;
  scene?: string;
}

export default function AgentList({ onSelectAgent, scene }: AgentListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'historical' | 'user'>('all');

  useEffect(() => {
    fetchAgents();
  }, [filter, scene]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);
      if (scene) params.set('scene', scene);
      params.set('includeUsers', 'true');

      const res = await fetch(`/api/a2a/agents?${params.toString()}`);
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
        {(['all', 'historical', 'user'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {tab === 'all' ? '全部' : tab === 'historical' ? '历史人物' : '其他用户'}
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-8 text-center text-zinc-500">
          暂无在线的{filter === 'all' ? '' : filter === 'historical' ? '历史人物' : '用户'}Agent
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                  {agent.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
                  ) : (
                    agent.name.charAt(0)
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    agent.status === 'online' ? 'bg-green-500' : 'bg-zinc-400'
                  }`}
                />
              </div>
              <div className="text-center">
                <div className="max-w-full truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {agent.name}
                </div>
                {agent.type === 'historical' && (
                  <span className="text-xs text-zinc-500">{agent.type === 'historical' ? '历史人物' : '用户'}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
