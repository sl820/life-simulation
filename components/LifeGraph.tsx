'use client';

import { useState, useMemo } from 'react';

interface Branch {
  id: string;
  parentId: string | null;
  label: string;
  decisionQuestion?: string;
  chosenOption?: string;
  outcome?: string;
  eventCount: number;
  stats: {
    finalHappiness?: number;
    finalCharacter?: number;
  };
}

interface LifeGraphProps {
  branches: Branch[];
  rootId: string;
  onBranchClick?: (branchId: string) => void;
}

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  depth: number;
  branch: Branch;
}

function buildTree(branches: Branch[], rootId: string): TreeNode | null {
  const branchMap = new Map(branches.map((b) => [b.id, b]));
  const root = branchMap.get(rootId);
  if (!root) return null;

  function buildNode(branch: Branch, depth: number): TreeNode {
    const children = branches
      .filter((b) => b.parentId === branch.id)
      .map((b) => buildNode(b, depth + 1));

    return {
      id: branch.id,
      label: branch.label,
      children,
      depth,
      branch,
    };
  }

  return buildNode(root, 0);
}

function TreeNodeComponent({
  node,
  onBranchClick,
  selectedId,
}: {
  node: TreeNode;
  onBranchClick?: (id: string) => void;
  selectedId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  const nodeColor = isSelected
    ? 'bg-blue-500 text-white'
    : node.depth === 0
    ? 'bg-purple-500 text-white'
    : 'bg-emerald-500 text-white';

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${nodeColor}`}
        onClick={() => {
          onBranchClick?.(node.id);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        title={`${node.label}${node.branch.chosenOption ? `\n选择: ${node.branch.chosenOption}` : ''}`}
      >
        {node.label}
        {hasChildren && (
          <span className="ml-1 text-xs">{isExpanded ? '▼' : '▶'}</span>
        )}
      </div>

      {/* Branch info tooltip */}
      {isSelected && node.branch.chosenOption && (
        <div className="mt-2 max-w-48 rounded-lg border border-zinc-200 bg-white p-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <div className="font-medium text-blue-600">选择: {node.branch.chosenOption}</div>
          {node.branch.outcome && (
            <div className="mt-1 text-zinc-600 dark:text-zinc-400">{node.branch.outcome}</div>
          )}
          {node.branch.stats.finalHappiness !== undefined && (
            <div className="mt-1">
              <span className="text-zinc-500">幸福感: </span>
              <span className={node.branch.stats.finalHappiness > 0.5 ? 'text-green-600' : 'text-red-600'}>
                {Math.round(node.branch.stats.finalHappiness * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-4 flex gap-8">
          {node.children.map((child) => (
            <div key={child.id} className="relative flex flex-col items-center">
              {/* Connector line */}
              <div className="absolute -top-4 h-4 w-0.5 bg-zinc-300 dark:bg-zinc-600" />
              {/* Horizontal line */}
              <div
                className="absolute -top-4 h-0.5 bg-zinc-300 dark:bg-zinc-600"
                style={{
                  left: '50%',
                  width: `${Math.abs(node.children.length - 1) * 80 + 40}px`,
                  transform: child === node.children[0] ? 'translateX(-100%)' : 'none',
                }}
              />
              <TreeNodeComponent
                node={child}
                onBranchClick={onBranchClick}
                selectedId={selectedId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LifeGraph({ branches, rootId, onBranchClick }: LifeGraphProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>();

  const tree = useMemo(() => buildTree(branches, rootId), [branches, rootId]);

  const handleBranchClick = (branchId: string) => {
    setSelectedBranchId(branchId);
    onBranchClick?.(branchId);
  };

  if (!tree) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-600">
        <span className="text-4xl">🌳</span>
        <p className="mt-2 text-sm text-zinc-500">暂无分支数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500" />
          <span className="text-zinc-600 dark:text-zinc-400">起点</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-600 dark:text-zinc-400">分支</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-zinc-600 dark:text-zinc-400">当前选中</span>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 p-8 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900">
        <div className="flex min-w-max justify-center">
          <TreeNodeComponent
            node={tree}
            onBranchClick={handleBranchClick}
            selectedId={selectedBranchId}
          />
        </div>
      </div>

      {/* Branch Summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => handleBranchClick(branch.id)}
            className={`rounded-lg border p-2 text-left text-xs transition-all ${
              selectedBranchId === branch.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
            }`}
          >
            <div className="truncate font-medium">{branch.label}</div>
            {branch.chosenOption && (
              <div className="mt-1 truncate text-zinc-500">{branch.chosenOption}</div>
            )}
            <div className="mt-1 flex justify-between text-zinc-400">
              <span>{branch.eventCount}事件</span>
              {branch.stats.finalHappiness !== undefined && (
                <span className={branch.stats.finalHappiness > 0.5 ? 'text-green-600' : 'text-red-600'}>
                  {(branch.stats.finalHappiness * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Empty state if no branches */}
      {branches.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-600">
          <span className="text-4xl">🌱</span>
          <p className="mt-2 text-sm text-zinc-500">还没有分支</p>
          <p className="text-xs text-zinc-400">做出决策后，将产生新的分支</p>
        </div>
      )}
    </div>
  );
}
