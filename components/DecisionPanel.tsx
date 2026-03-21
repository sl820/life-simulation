'use client';

interface DecisionOption {
  id: string;
  content: string;
  pros?: string[];
  cons?: string[];
  predicted: {
    characterChange: number;
    successProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

interface DecisionPanelProps {
  decision: {
    id: string;
    question: string;
    context: string;
    options: DecisionOption[];
  };
  onSelect: (optionId: string) => void;
  onAIAutoSelect?: () => void;
  loading?: boolean;
}

const RISK_CONFIG = {
  low: { label: '低风险', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: '中等风险', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: '高风险', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export default function DecisionPanel({
  decision,
  onSelect,
  onAIAutoSelect,
  loading = false,
}: DecisionPanelProps) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-6 shadow-lg dark:border-blue-800 dark:from-blue-900/20 dark:to-zinc-900">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            ⚡
          </span>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">决策点</h3>
        </div>
        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{decision.question}</p>
        <p className="mt-1 text-sm text-zinc-500">{decision.context}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {decision.options.map((option, index) => {
          const risk = RISK_CONFIG[option.predicted.riskLevel];
          const letter = ['A', 'B', 'C', 'D'][index];

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={loading}
              className="group w-full rounded-xl border-2 border-zinc-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-600"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-zinc-700 dark:text-zinc-300 dark:group-hover:bg-blue-900/30">
                    {letter}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{option.content}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${risk.bgColor} ${risk.color}`}>
                  {risk.label}
                </span>
              </div>

              {/* Pros & Cons */}
              <div className="ml-10 mt-2 flex gap-4 text-xs">
                {option.pros && option.pros.length > 0 && (
                  <div className="flex-1">
                    <span className="text-green-600">✓ </span>
                    {option.pros.slice(0, 2).join(', ')}
                  </div>
                )}
                {option.cons && option.cons.length > 0 && (
                  <div className="flex-1">
                    <span className="text-red-600">✗ </span>
                    {option.cons.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="ml-10 mt-2 flex gap-4 text-xs text-zinc-500">
                <span>
                  成功率: {Math.round(option.predicted.successProbability * 100)}%
                </span>
                <span>
                  成长值: {option.predicted.characterChange > 0 ? '+' : ''}
                  {option.predicted.characterChange}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Auto Select */}
      {onAIAutoSelect && (
        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <button
            onClick={onAIAutoSelect}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <span>🤖</span>
            <span>{loading ? 'AI思考中...' : '让AI自动选择'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
