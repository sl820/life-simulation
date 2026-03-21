'use client';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    type: 'narrative' | 'encounter' | 'challenge' | 'opportunity' | 'milestone' | 'a2a';
    virtualDate?: string;
    impact?: Record<string, number>;
    a2aData?: {
      participantIds: string[];
      summary: string;
    };
  };
  isActive?: boolean;
  onClick?: () => void;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  narrative: { icon: '📖', color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
  encounter: { icon: '🤝', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  challenge: { icon: '⚔️', color: 'text-red-600', bgColor: 'bg-red-100' },
  opportunity: { icon: '✨', color: 'text-green-600', bgColor: 'bg-green-100' },
  milestone: { icon: '⭐', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  a2a: { icon: '💬', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export default function EventCard({ event, isActive = false, onClick }: EventCardProps) {
  const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.narrative;

  return (
    <div
      className={`group cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600'
      }`}
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor} text-sm`}
          >
            {config.icon}
          </span>
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{event.title}</h4>
            {event.virtualDate && (
              <span className="text-xs text-zinc-500">{event.virtualDate}</span>
            )}
          </div>
        </div>
        {event.type === 'milestone' && (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
            关键节点
          </span>
        )}
      </div>

      <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>

      {/* Impact indicators */}
      {event.impact && Object.keys(event.impact).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(event.impact).map(([key, value]) => {
            if (key === 'knowledge') return null;
            const isPositive = value > 0;
            return (
              <span
                key={key}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isPositive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {key === 'happiness' && (isPositive ? '😊' : '😔')}
                {key === 'character' && (isPositive ? '🧠' : '📉')}
                {key === 'confidence' && (isPositive ? '💪' : '😟')}
                {key === 'wealth' && (isPositive ? '💰' : '💸')}
                {key === 'health' && (isPositive ? '🏥' : '🤕')}
                {isPositive ? '+' : ''}
                {typeof value === 'number' ? value.toFixed(1) : value}
              </span>
            );
          })}
        </div>
      )}

      {/* A2A indicator */}
      {event.type === 'a2a' && event.a2aData && (
        <div className="mt-2 rounded-lg bg-purple-50 p-2 text-xs text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
          💬 A2A交互: {event.a2aData.summary || '与Agent对话中...'}
        </div>
      )}
    </div>
  );
}
