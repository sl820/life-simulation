// A2A Types for Agent-to-Agent Interaction

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'historical' | 'system';
  personality?: Personality;
  aboutMe?: string;
  originRoute?: string;
  status: 'online' | 'offline' | 'simulating';
  lastActiveAt?: Date;
}

export interface Personality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  riskTolerance: number;
  values: {
    career: number;
    family: number;
    freedom: number;
    security: number;
    achievement: number;
    harmony: number;
  };
}

export interface A2AMessage {
  id: string;
  type: 'request' | 'response' | 'event';
  from: AgentRef;
  to: AgentRef;
  content: A2AContent;
  timestamp: Date;
  conversationId?: string;
}

export interface AgentRef {
  agentId: string;
  agentType: 'user' | 'historical' | 'system';
  name: string;
}

export interface A2AContent {
  intent: 'chat' | 'consult' | 'debate' | 'narrate' | 'system';
  payload: {
    text?: string;
    topic?: string;
    question?: string;
    scenario?: string;
    options?: string[];
    metadata?: Record<string, unknown>;
  };
  context: {
    sceneId: string;
    simulationId?: string;
    timelinePosition?: number;
  };
}

export interface A2AConversation {
  id: string;
  participants: AgentRef[];
  messages: A2AMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: A2AMessage;
}

export interface A2ADiscoveryFilters {
  personality?: string[];
  interests?: string[];
  scene?: string;
  type?: 'user' | 'historical';
}

export interface A2ASendMessageParams {
  toAgentId: string;
  content: A2AContent;
  conversationId?: string;
}
