import {
  Agent,
  A2AMessage,
  A2AConversation,
  A2ADiscoveryFilters,
  AgentRef,
  A2AContent,
} from './types';

// In-memory agent registry (replace with database in production)
const agentRegistry = new Map<string, Agent>();
const conversations = new Map<string, A2AConversation>();

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Agent Registry
export function registerAgent(agent: Agent): void {
  agentRegistry.set(agent.id, {
    ...agent,
    lastActiveAt: new Date(),
  });
}

export function getAgent(agentId: string): Agent | undefined {
  return agentRegistry.get(agentId);
}

export function updateAgentStatus(agentId: string, status: Agent['status']): void {
  const agent = agentRegistry.get(agentId);
  if (agent) {
    agentRegistry.set(agentId, { ...agent, status, lastActiveAt: new Date() });
  }
}

export function getOnlineAgents(): Agent[] {
  return Array.from(agentRegistry.values()).filter((a) => a.status === 'online');
}

export function discoverAgents(filters?: A2ADiscoveryFilters): Agent[] {
  let agents = Array.from(agentRegistry.values());

  if (filters?.type) {
    agents = agents.filter((a) => a.type === filters.type);
  }

  if (filters?.personality?.length) {
    agents = agents.filter((a) => {
      if (!a.personality) return false;
      // Simple filter - in production would use vector similarity
      return filters.personality!.some((p) => JSON.stringify(a.personality).includes(p));
    });
  }

  return agents;
}

// Create agent reference from agent
export function toAgentRef(agent: Agent): AgentRef {
  return {
    agentId: agent.id,
    agentType: agent.type,
    name: agent.name,
  };
}

// Conversations
export function getOrCreateConversation(participantIds: string[]): A2AConversation {
  // Check if conversation already exists between these participants
  const sortedIds = participantIds.sort().join(',');

  for (const conv of conversations.values()) {
    const convParticipantIds = conv.participants.map((p) => p.agentId).sort().join(',');
    if (convParticipantIds === sortedIds) {
      return conv;
    }
  }

  // Create new conversation
  const participants = participantIds
    .map((id) => agentRegistry.get(id))
    .filter((a): a is Agent => a !== undefined)
    .map(toAgentRef);

  const conversation: A2AConversation = {
    id: generateId(),
    participants,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  conversations.set(conversation.id, conversation);
  return conversation;
}

export function getConversation(conversationId: string): A2AConversation | undefined {
  return conversations.get(conversationId);
}

export function getAgentConversations(agentId: string): A2AConversation[] {
  return Array.from(conversations.values()).filter((conv) =>
    conv.participants.some((p) => p.agentId === agentId)
  );
}

// Message Handling
export async function sendMessage(
  fromAgentId: string,
  toAgentId: string,
  content: A2AContent
): Promise<A2AMessage> {
  const fromAgent = agentRegistry.get(fromAgentId);
  const toAgent = agentRegistry.get(toAgentId);

  if (!fromAgent || !toAgent) {
    throw new Error('Agent not found');
  }

  // Get or create conversation
  const conversation = getOrCreateConversation([fromAgentId, toAgentId]);

  const message: A2AMessage = {
    id: generateId(),
    type: 'request',
    from: toAgentRef(fromAgent),
    to: toAgentRef(toAgent),
    content,
    timestamp: new Date(),
    conversationId: conversation.id,
  };

  // Add to conversation
  conversation.messages.push(message);
  conversation.lastMessage = message;
  conversation.updatedAt = new Date();

  // Update agent status
  updateAgentStatus(fromAgentId, 'online');
  updateAgentStatus(toAgentId, 'online');

  // In production: route to actual agent endpoint
  // For now, simulate response for historical agents
  if (toAgent.type === 'historical') {
    // Simulate historical figure response
    const response = await simulateHistoricalResponse(message);
    conversation.messages.push(response);
    conversation.lastMessage = response;
    conversation.updatedAt = new Date();
  }

  return message;
}

export function getConversationMessages(
  conversationId: string,
  limit = 50,
  before?: string
): A2AMessage[] {
  const conversation = conversations.get(conversationId);
  if (!conversation) return [];

  let messages = [...conversation.messages];

  if (before) {
    const beforeIndex = messages.findIndex((m) => m.id === before);
    if (beforeIndex > 0) {
      messages = messages.slice(0, beforeIndex);
    }
  }

  return messages.slice(-limit);
}

// Simulate historical figure response
async function simulateHistoricalResponse(message: A2AMessage): Promise<A2AMessage> {
  const { to } = message;

  // Generate contextual response based on topic
  const responses: Record<string, string[]> = {
    default: [
      '人生如逆旅，我亦是行人。',
      '知之者不如好之者，好之者不如乐之者。',
      '学而不思则罔，思而不学则殆。',
    ],
    happiness: ['幸福者，仁之端也。', '己所不欲，勿施于人。'],
    career: ['三十而立，四十而不惑。', '君子务本，本立而道生。'],
    choice: ['鱼与熊掌，不可得兼。', '两害相权取其轻，两利相权取其重。'],
  };

  const topic = message.content.payload.topic?.toLowerCase() || 'default';
  let pool = responses.default;

  for (const [key, value] of Object.entries(responses)) {
    if (topic.includes(key)) {
      pool = value;
      break;
    }
  }

  const responseText = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: generateId(),
    type: 'response',
    from: to,
    to: message.from,
    content: {
      intent: 'chat',
      payload: { text: responseText },
      context: message.content.context,
    },
    timestamp: new Date(),
    conversationId: message.conversationId,
  };
}

// Historical figures registry
export const historicalFigures: Agent[] = [
  {
    id: 'confucius',
    name: '孔子',
    type: 'historical',
    personality: {
      openness: 0.7,
      conscientiousness: 0.9,
      extraversion: 0.5,
      agreeableness: 0.8,
      neuroticism: 0.2,
      riskTolerance: 0.3,
      values: { career: 0.6, family: 0.8, freedom: 0.4, security: 0.7, achievement: 0.5, harmony: 0.9 },
    },
    aboutMe: '春秋末期鲁国陬邑人，儒家学派创始人',
    status: 'online',
  },
  {
    id: 'socrates',
    name: '苏格拉底',
    type: 'historical',
    personality: {
      openness: 0.9,
      conscientiousness: 0.8,
      extraversion: 0.6,
      agreeableness: 0.7,
      neuroticism: 0.1,
      riskTolerance: 0.4,
      values: { career: 0.5, family: 0.4, freedom: 0.9, security: 0.3, achievement: 0.6, harmony: 0.5 },
    },
    aboutMe: '古希腊哲学家，西方哲学奠基人',
    status: 'online',
  },
  {
    id: 'musk',
    name: '马斯克',
    type: 'historical',
    personality: {
      openness: 0.95,
      conscientiousness: 0.7,
      extraversion: 0.8,
      agreeableness: 0.4,
      neuroticism: 0.6,
      riskTolerance: 0.95,
      values: { career: 0.9, family: 0.3, freedom: 0.9, security: 0.2, achievement: 0.95, harmony: 0.3 },
    },
    aboutMe: '特斯拉、SpaceX创始人，倡导多星球文明',
    status: 'online',
  },
  {
    id: 'einstein',
    name: '爱因斯坦',
    type: 'historical',
    personality: {
      openness: 0.95,
      conscientiousness: 0.6,
      extraversion: 0.4,
      agreeableness: 0.7,
      neuroticism: 0.3,
      riskTolerance: 0.6,
      values: { career: 0.8, family: 0.5, freedom: 0.9, security: 0.4, achievement: 0.9, harmony: 0.5 },
    },
    aboutMe: '理论物理学家，相对论创立者',
    status: 'online',
  },
];

// Initialize historical figures
historicalFigures.forEach(registerAgent);
