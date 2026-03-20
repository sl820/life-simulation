// Scene Types

export interface Scene {
  id: string;
  metadata: SceneMetadata;
  time: TimeConfig;
  characters: CharacterConfig;
  eventLibrary: EventLibrary;
  decisionLibrary: DecisionTemplate[];
  scripts: SceneScripts;
}

export interface SceneMetadata {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: 'life' | 'career' | 'education' | 'relationship' | 'adventure';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  tags: string[];
  coverImage?: string;
}

export interface TimeConfig {
  startYear: number;
  endYear?: number;
  granularity: 'year' | 'month' | 'week';
  defaultSpeed: number; // 1现实分钟 = N虚拟时间单位
}

export interface CharacterConfig {
  protagonist: ProtagonistConfig;
  supporting: SupportingCharacter[];
  historical?: string[]; // 历史人物ID列表
}

export interface ProtagonistConfig {
  initialState: {
    age: number;
    personality: Personality;
    skills: string[];
    relationships: Relationship[];
    status: Record<string, unknown>;
  };
  constraints: {
    maxAge?: number;
    maxBranches?: number;
    maxCheckpoints?: number;
    requiredEvents?: string[];
  };
}

export interface SupportingCharacter {
  id: string;
  name: string;
  role: 'mentor' | 'rival' | 'partner' | 'family' | 'friend';
  personality: Personality;
  background: string;
  interaction: {
    triggerConditions: TriggerCondition[];
    dialogueStyle: string;
    possibleTopics: string[];
  };
  presence: {
    firstAppearance: number;
    lastAppearance?: number;
    frequency: number;
  };
}

export interface TriggerCondition {
  type: 'time' | 'event' | 'personality';
  value: string | number;
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

export interface Relationship {
  name: string;
  type: 'family' | 'friend' | 'mentor' | 'colleague' | 'stranger';
  closeness: number;
}

export interface EventLibrary {
  milestones: MilestoneEvent[];
  random: RandomEvent[];
  encounters: EncounterEvent[];
}

export interface MilestoneEvent {
  id: string;
  name: string;
  month: number;
  type: 'milestone';
  description: string;
  impact: EventImpact;
  nextDecision?: string;
  isFinal?: boolean;
}

export interface RandomEvent {
  id: string;
  name: string;
  monthRange: [number, number];
  weight: number;
  effect: Partial<EventImpact>;
  conditions?: TriggerCondition[];
}

export interface EncounterEvent {
  id: string;
  name: string;
  conditions: TriggerCondition[];
  characters: string[];
  outcome: EventImpact;
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

export interface DecisionTemplate {
  id: string;
  trigger: TriggerCondition;
  question: string;
  context: string;
  options: DecisionOption[];
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

export interface SceneScripts {
  opening: string;
  closing: string;
  transitions: TransitionScript[];
}

export interface TransitionScript {
  fromEvent: string;
  toEvent: string;
  script: string;
}

// Built-in scenes
export const BUILT_IN_SCENES: Scene[] = [
  {
    id: 'philosophy-debate',
    metadata: {
      id: 'philosophy-debate',
      name: '思想碰撞',
      nameEn: 'Philosophy Debate',
      description: '与历史人物进行深度的哲学对话，探讨人生的意义、幸福、选择等永恒话题。',
      category: 'life',
      difficulty: 'medium',
      duration: '30分钟',
      tags: ['哲学', '人生', '对话', '成长'],
    },
    time: {
      startYear: 2024,
      granularity: 'year',
      defaultSpeed: 365,
    },
    characters: {
      protagonist: {
        initialState: {
          age: 25,
          personality: {
            openness: 0.6,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.6,
            neuroticism: 0.4,
            riskTolerance: 0.5,
            values: {
              career: 0.6,
              family: 0.5,
              freedom: 0.7,
              security: 0.4,
              achievement: 0.6,
              harmony: 0.5,
            },
          },
          skills: ['思考', '沟通'],
          relationships: [],
          status: { happiness: 0.6 },
        },
        constraints: {
          maxBranches: 5,
          maxCheckpoints: 5,
        },
      },
      supporting: [],
      historical: ['confucius', 'socrates', 'musk', 'einstein'],
    },
    eventLibrary: {
      milestones: [
        {
          id: 'start',
          name: '开启对话',
          month: 0,
          type: 'milestone',
          description: '选择一个哲学话题，开始与历史人物的对话',
          impact: {},
          nextDecision: 'choose_topic',
        },
        {
          id: 'deep_discussion',
          name: '深度讨论',
          month: 3,
          type: 'milestone',
          description: '对话逐渐深入，开始触及核心价值观',
          impact: { character: 0.1 },
        },
        {
          id: 'conclusion',
          name: '形成结论',
          month: 6,
          type: 'milestone',
          description: '通过对话形成自己的人生见解',
          impact: { character: 0.15, confidence: 0.1 },
          isFinal: true,
        },
      ],
      random: [
        {
          id: 'new_perspective',
          name: '获得新视角',
          monthRange: [1, 5],
          weight: 0.3,
          effect: { knowledge: ['新思维框架'] },
        },
        {
          id: 'doubts',
          name: '产生疑问',
          monthRange: [2, 4],
          weight: 0.2,
          effect: { confidence: -0.1 },
        },
      ],
      encounters: [],
    },
    decisionLibrary: [
      {
        id: 'choose_topic',
        trigger: { type: 'event', value: 'start' },
        question: '你想讨论什么话题？',
        context: '与历史人物对话的机会难得，选择一个你最关心的话题',
        options: [
          {
            id: 'happiness',
            content: '什么是幸福？',
            pros: ['触及人生核心问题', '获得多元视角'],
            cons: ['可能没有标准答案'],
            predicted: { characterChange: 0.05, successProbability: 0.8, riskLevel: 'low' },
          },
          {
            id: 'choice',
            content: '如何做出重要的人生选择？',
            pros: ['实用性强', '直接指导现实'],
            cons: ['选择因人而异'],
            predicted: { characterChange: 0.08, successProbability: 0.7, riskLevel: 'medium' },
          },
          {
            id: 'meaning',
            content: '人生的意义是什么？',
            pros: ['终极哲学问题', '深刻影响价值观'],
            cons: ['可能越想越困惑'],
            predicted: { characterChange: 0.1, successProbability: 0.6, riskLevel: 'high' },
          },
        ],
      },
    ],
    scripts: {
      opening: '欢迎来到思想碰撞。在这里，你可以与古今中外的伟大思想家对话，探讨人生的根本问题。',
      closing: '通过这次对话，希望你获得了新的思考角度。记住，没有标准答案，只有属于你自己的答案。',
      transitions: [],
    },
  },
  {
    id: 'cross-time-dialogue',
    metadata: {
      id: 'cross-time-dialogue',
      name: '跨时空对话',
      nameEn: 'Cross-Time Dialogue',
      description: '与未来的自己对话，了解不同选择带来的不同人生轨迹。',
      category: 'life',
      difficulty: 'easy',
      duration: '20分钟',
      tags: ['成长', '未来', '选择', '反思'],
    },
    time: {
      startYear: 2024,
      endYear: 2044,
      granularity: 'year',
      defaultSpeed: 730, // 2年/分钟
    },
    characters: {
      protagonist: {
        initialState: {
          age: 25,
          personality: {
            openness: 0.6,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.6,
            neuroticism: 0.4,
            riskTolerance: 0.5,
            values: {
              career: 0.6,
              family: 0.5,
              freedom: 0.7,
              security: 0.4,
              achievement: 0.6,
              harmony: 0.5,
            },
          },
          skills: ['规划', '执行'],
          relationships: [],
          status: { happiness: 0.6, careerLevel: 0.3 },
        },
        constraints: {
          maxBranches: 3,
          maxCheckpoints: 3,
        },
      },
      supporting: [],
    },
    eventLibrary: {
      milestones: [
        {
          id: 'meet_future_self',
          name: '遇见未来的自己',
          month: 0,
          type: 'milestone',
          description: '时间线交汇，你遇到了10年后的自己',
          impact: {},
          nextDecision: 'ask_questions',
        },
        {
          id: 'see_paths',
          name: '看见不同路径',
          month: 12,
          type: 'milestone',
          description: '通过时间线分叉，看到了不同选择带来的结果',
          impact: { character: 0.1 },
          isFinal: true,
        },
      ],
      random: [],
      encounters: [],
    },
    decisionLibrary: [
      {
        id: 'ask_questions',
        trigger: { type: 'event', value: 'meet_future_self' },
        question: '你想问未来的自己什么？',
        context: '难得的机会，可以从未来视角审视现在的选择',
        options: [
          {
            id: 'regrets',
            content: '你有什么遗憾吗？',
            pros: ['了解可能的错误', '提前规避'],
            predicted: { characterChange: 0.05, successProbability: 0.9, riskLevel: 'low' },
          },
          {
            id: 'advice',
            content: '你对我有什么建议？',
            pros: ['获得指导', '明确方向'],
            predicted: { characterChange: 0.08, successProbability: 0.9, riskLevel: 'low' },
          },
          {
            id: 'happiness',
            content: '你幸福吗？',
            pros: ['了解最终目标', '反思当前选择'],
            predicted: { characterChange: 0.1, successProbability: 0.7, riskLevel: 'medium' },
          },
        ],
      },
    ],
    scripts: {
      opening: '欢迎来到跨时空对话。在这里，你可以与未来的自己相遇，看看不同选择会如何影响你的人生。',
      closing: '记住，未来不是固定的，而是由现在每一个选择塑造的。',
      transitions: [],
    },
  },
];
