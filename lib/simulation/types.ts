// Simulation Types

import { Personality } from '@/lib/a2a/types';

export interface Simulation {
  id: string;
  userId: string;
  sceneId: string;
  status: SimulationStatus;
  config: SimulationConfig;
  state: SimulationState;
  timeline: Timeline;
  branches: Branch[];
  checkpoints: Checkpoint[];
  createdAt: Date;
  updatedAt: Date;
}

export type SimulationStatus = 'draft' | 'running' | 'paused' | 'completed' | 'abandoned';

export interface SimulationConfig {
  startDate: Date;
  endDate?: Date;
  speed: number; // 时间加速比
  granularity: 'year' | 'month' | 'week';
  autoSave: boolean;
  maxBranches: number;
  maxCheckpoints: number;
}

export interface SimulationState {
  currentDate: Date;
  currentEpoch: string;
  currentBranchId: string;
  position: number; // 进度百分比
  protagonist: ProtagonistState;
  stats: SimulationStats;
}

export interface ProtagonistState {
  age: number;
  personality: Personality;
  skills: string[];
  relationships: RelationshipState[];
  status: Record<string, unknown>;
}

export interface RelationshipState {
  name: string;
  type: string;
  closeness: number;
  events: string[];
}

export interface SimulationStats {
  eventCount: number;
  decisionCount: number;
  a2aInteractionCount: number;
  branchCount: number;
  checkpointCount: number;
}

export interface Timeline {
  id: string;
  epochs: Epoch[];
  events: TimelineEvent[];
  decisions: DecisionRecord[];
}

export interface Epoch {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  theme: string;
  milestoneEventIds: string[];
}

export interface TimelineEvent {
  id: string;
  epochId: string;
  branchId: string;
  virtualDate: Date;
  sequence: number;
  type: 'narrative' | 'encounter' | 'challenge' | 'opportunity' | 'milestone' | 'a2a';
  title: string;
  description: string;
  impact: EventImpact;
  source: 'system' | 'user' | 'ai' | 'historical_agent';
  a2aData?: A2AEventData;
}

export interface A2AEventData {
  conversationId: string;
  participantIds: string[];
  summary: string;
}

export interface EventImpact {
  character?: number;
  knowledge?: string[];
  relationship?: Record<string, number>;
  wealth?: number;
  health?: number;
  happiness?: number;
  confidence?: number;
}

export interface DecisionRecord {
  id: string;
  eventId: string;
  virtualDate: Date;
  question: string;
  context: string;
  options: DecisionOption[];
  chosenOptionId?: string;
  chosenAt?: Date;
  outcome?: DecisionOutcome;
  branchId: string;
}

export interface DecisionOption {
  id: string;
  content: string;
  pros?: string[];
  cons?: string[];
  predicted: {
    characterChange: number;
    successProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  effects?: EventImpact;
}

export interface DecisionOutcome {
  immediate: string;
  shortTerm: string;
  longTerm: string;
  actualImpact: EventImpact;
  narrative: string;
}

export interface Branch {
  id: string;
  parentBranchId: string | null;
  decisionPointId: string;
  path: string[]; // event IDs
  stats: BranchStats;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
}

export interface BranchStats {
  eventCount: number;
  finalCharacter?: number;
  finalWealth?: number;
  finalHealth?: number;
  finalHappiness?: number;
}

export interface Checkpoint {
  id: string;
  simulationId: string;
  branchId: string;
  name: string;
  description?: string;
  snapshot: CheckpointSnapshot;
  createdAt: Date;
}

export interface CheckpointSnapshot {
  date: Date;
  epochId: string;
  state: SimulationState;
  events: TimelineEvent[];
  decisions: DecisionRecord[];
}
