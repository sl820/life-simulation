'use client';

import { useState } from 'react';
import EventCard from './EventCard';

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

interface TimelineDisplayProps {
  events: TimelineEvent[];
  currentEventId?: string;
  position: number;
  onEventClick?: (eventId: string) => void;
}

const PHASE_LABELS = [
  { min: 0, max: 18, label: '启蒙期', color: 'bg-blue-500' },
  { min: 18, max: 25, label: '高等教育', color: 'bg-green-500' },
  { min: 25, max: 35, label: '职业发展', color: 'bg-yellow-500' },
  { min: 35, max: 50, label: '稳定转型', color: 'bg-orange-500' },
  { min: 50, max: 65, label: '传承退休', color: 'bg-red-500' },
];

function getPhase(age: number) {
  return PHASE_LABELS.find((p) => age >= p.min && age < p.max) || PHASE_LABELS[0];
}

export default function TimelineDisplay({
  events,
  currentEventId,
  position,
  onEventClick,
}: TimelineDisplayProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(currentEventId || null);

  const handleEventClick = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
    onEventClick?.(eventId);
  };

  // Get current age from position (simplified calculation)
  const currentAge = Math.floor(18 + (position / 100) * 47); // 18 to 65
  const currentPhase = getPhase(currentAge);

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">时间线</h3>
          <p className="text-sm text-zinc-500">共 {events.length} 个事件</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium text-white ${currentPhase.color}`}
          >
            {currentPhase.label}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>18岁</span>
          <span className="font-medium text-blue-600">当前: {currentAge}岁</span>
          <span>65岁</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${position}%` }}
          />
          {/* Phase markers */}
          {PHASE_LABELS.map((phase, i) => (
            <div
              key={phase.label}
              className="absolute top-0 h-full w-0.5 bg-zinc-400/50"
              style={{ left: `${((phase.min - 18) / 47) * 100}%` }}
              title={phase.label}
            />
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-600">
            <span className="text-4xl">🌱</span>
            <p className="mt-2 text-sm text-zinc-500">时间线尚未开始</p>
            <p className="text-xs text-zinc-400">开始推演后，事件将显示在这里</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline connector */}
              {index < events.length - 1 && (
                <div className="absolute left-4 top-12 h-full w-0.5 bg-zinc-200 dark:bg-zinc-700" />
              )}
              <EventCard
                event={event}
                isActive={event.id === currentEventId}
                onClick={() => handleEventClick(event.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
