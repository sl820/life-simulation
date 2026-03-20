// Analysis Report Types

export interface AnalysisReport {
  meta: ReportMeta;
  visualizations: ReportVisualizations;
  insights: ReportInsights;
  recommendations: ReportRecommendations;
}

export interface ReportMeta {
  simulationId: string;
  sceneId: string;
  sceneName: string;
  duration: number; // 推演时长（分钟）
  branchCount: number;
  eventCount: number;
  a2aInteractionCount: number;
  startDate: string;
  endDate: string;
}

export interface ReportVisualizations {
  timeline: TimelineVisualization;
  personalityChart: PersonalityChart;
  branchTree: BranchTree;
  knowledgeGraph: KnowledgeGraph;
  a2aNetwork: A2ANetwork;
}

export interface TimelineVisualization {
  events: TimelineEventNode[];
  milestones: string[]; // event IDs
  branches: { id: string; color: string }[];
}

export interface TimelineEventNode {
  id: string;
  date: string;
  title: string;
  type: string;
  branchId: string;
  impact?: Record<string, number>;
}

export interface PersonalityChart {
  before: PersonalityData;
  after: PersonalityData;
  changes: PersonalityChange[];
}

export interface PersonalityData {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  riskTolerance: number;
}

export interface PersonalityChange {
  trait: string;
  before: number;
  after: number;
  change: number; // percentage
}

export interface BranchTree {
  branches: BranchNode[];
  rootId: string;
}

export interface BranchNode {
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

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'skill' | 'concept' | 'relationship' | 'value';
  acquired: string; // date acquired
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  label?: string;
}

export interface A2ANetwork {
  nodes: A2ANode[];
  edges: A2AEdge[];
}

export interface A2ANode {
  id: string;
  name: string;
  type: 'user' | 'historical' | 'system';
  avatar?: string;
  interactionCount: number;
}

export interface A2AEdge {
  from: string;
  to: string;
  weight: number; // interaction frequency
  lastInteraction?: string;
}

export interface ReportInsights {
  decision: DecisionInsight;
  personality: PersonalityInsight;
  a2a: A2AInsight;
  knowledge: KnowledgeInsight;
}

export interface DecisionInsight {
  totalDecisions: number;
  successfulDecisions: number;
  successRate: number;
  keyPatterns: string[];
  avoidPatterns: string[];
  mostInfluentialDecision?: {
    question: string;
    impact: string;
  };
}

export interface PersonalityInsight {
  mostChangedTrait: string;
  stabilityScore: number; // 0-1
  growthAreas: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface A2AInsight {
  totalInteractions: number;
  mostInteractedWith?: {
    name: string;
    type: string;
    count: number;
  };
  conversationHighlights: {
    participant: string;
    quote: string;
    date: string;
  }[];
}

export interface KnowledgeInsight {
  skills: string[];
  concepts: string[];
  relationships: string[];
  values: string[];
  growthAreas: string[];
}

export interface ReportRecommendations {
  shortTerm: string[];  // 1-3年
  mediumTerm: string[]; // 5-10年
  longTerm: string[];   // 20年+
}
