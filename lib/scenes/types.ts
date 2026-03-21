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
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
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
  {
    id: 'gaokao',
    metadata: {
      id: 'gaokao',
      name: '高考志愿',
      nameEn: 'College Entrance Exam',
      description: '回到18岁，重新体验高考填志愿的关键时刻。与学长学姐交流，了解各专业的真实情况。',
      category: 'education',
      difficulty: 'hard',
      duration: '45分钟',
      tags: ['高考', '志愿', '大学', '专业选择'],
    },
    time: {
      startYear: 2024,
      granularity: 'month',
      defaultSpeed: 60,
    },
    characters: {
      protagonist: {
        initialState: {
          age: 18,
          personality: {
            openness: 0.5,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.6,
            neuroticism: 0.4,
            riskTolerance: 0.4,
            values: {
              career: 0.5,
              family: 0.6,
              freedom: 0.5,
              security: 0.6,
              achievement: 0.5,
              harmony: 0.6,
            },
          },
          skills: ['学习', '考试'],
          relationships: [],
          status: { happiness: 0.7, score: 620 },
        },
        constraints: {
          maxBranches: 5,
          maxCheckpoints: 5,
        },
      },
      supporting: [
        {
          id: 'senior-cs',
          name: '计算机系学长',
          role: 'mentor',
          personality: { openness: 0.7, conscientiousness: 0.5, extraversion: 0.6, agreeableness: 0.5, neuroticism: 0.3, riskTolerance: 0.7, values: { career: 0.8, family: 0.4, freedom: 0.7, security: 0.3, achievement: 0.9, harmony: 0.4 } },
          background: '某985计算机系大四学生，已拿到大厂offer',
          interaction: { triggerConditions: [], dialogueStyle: '理性分析型', possibleTopics: ['专业前景', '学习难度', '就业情况'] },
          presence: { firstAppearance: 0, frequency: 1 },
        },
        {
          id: 'senior-finance',
          name: '金融系学姐',
          role: 'mentor',
          personality: { openness: 0.6, conscientiousness: 0.7, extraversion: 0.7, agreeableness: 0.6, neuroticism: 0.3, riskTolerance: 0.5, values: { career: 0.9, family: 0.5, freedom: 0.5, security: 0.5, achievement: 0.8, harmony: 0.5 } },
          background: '某top金融硕士，已入职投行',
          interaction: { triggerConditions: [], dialogueStyle: '现实主义型', possibleTopics: ['行业薪资', '工作强度', '发展前景'] },
          presence: { firstAppearance: 0, frequency: 1 },
        },
        {
          id: 'mentor',
          name: '班主任',
          role: 'mentor',
          personality: { openness: 0.4, conscientiousness: 0.8, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.4, riskTolerance: 0.3, values: { career: 0.5, family: 0.6, freedom: 0.3, security: 0.8, achievement: 0.5, harmony: 0.8 } },
          background: '带过十届毕业班，经验丰富',
          interaction: { triggerConditions: [], dialogueStyle: '经验型', possibleTopics: ['志愿填报技巧', '学校选择'] },
          presence: { firstAppearance: 0, frequency: 1 },
        },
      ],
      historical: ['musk', 'zhang-yiming'],
    },
    eventLibrary: {
      milestones: [
        { id: 'score_reveal', name: '成绩公布', month: 0, type: 'milestone', description: '高考成绩揭晓：620分，全省5000名', impact: {}, nextDecision: 'choose_major' },
        { id: 'consult_seniors', name: '学长学姐交流', month: 1, type: 'milestone', description: '与不同专业的学长学姐交流，了解真实情况', impact: { character: 0.05 } },
        { id: 'final_decision', name: '最终抉择', month: 2, type: 'milestone', description: '在截止日期前做出最终选择', impact: {}, isFinal: true },
      ],
      random: [
        { id: 'unexpected_news', name: '意外消息', monthRange: [1, 2], weight: 0.2, effect: { happiness: -0.1 } },
        { id: 'opportunity', name: '额外机会', monthRange: [1, 2], weight: 0.15, effect: { confidence: 0.1 } },
      ],
      encounters: [],
    },
    decisionLibrary: [
      {
        id: 'choose_major',
        trigger: { type: 'event', value: 'score_reveal' },
        question: '你的成绩可以冲击多所名校，但专业选择受限。你想学什么？',
        context: '高考志愿填报是人生第一个重大选择，它将影响你未来4年甚至更久的人生轨迹',
        options: [
          { id: 'cs', content: '计算机科学与技术', pros: ['就业前景好', '薪资高', '创业机会多'], cons: ['学习强度大', '竞争激烈'], predicted: { characterChange: 0.08, successProbability: 0.7, riskLevel: 'medium' } },
          { id: 'finance', content: '金融学', pros: ['发展前景好', '社交机会多'], cons: ['需要背景', '竞争激烈'], predicted: { characterChange: 0.06, successProbability: 0.6, riskLevel: 'medium' } },
          { id: 'medicine', content: '医学', pros: ['社会稳定', '社会地位高'], cons: ['学习周期长', '初期收入低'], predicted: { characterChange: 0.1, successProbability: 0.65, riskLevel: 'low' } },
          { id: 'ai', content: '人工智能（新专业）', pros: ['前沿领域', '政策支持'], cons: ['不确定性高', '要求高'], predicted: { characterChange: 0.12, successProbability: 0.5, riskLevel: 'high' } },
        ],
      },
      {
        id: 'choose_school',
        trigger: { type: 'event', value: 'consult_seniors' },
        question: '同一专业，多所学校可选。你选择哪类学校？',
        context: '学校排名、地理位置、专业实力都需要权衡',
        options: [
          { id: 'top', content: '冲刺名校（专业可能被调剂）', pros: ['学校名气大', '资源多'], cons: ['专业不确定', '压力大'], predicted: { characterChange: 0.05, successProbability: 0.5, riskLevel: 'high' } },
          { id: 'good', content: '选择专业实力强的普通985', pros: ['专业有保障', '竞争较小'], cons: ['学校名气一般'], predicted: { characterChange: 0.08, successProbability: 0.75, riskLevel: 'low' } },
          { id: 'safe', content: '求稳选择211（专业任选）', pros: ['专业自由', '压力小'], cons: ['学校排名较低'], predicted: { characterChange: 0.03, successProbability: 0.9, riskLevel: 'low' } },
        ],
      },
    ],
    scripts: {
      opening: '欢迎来到高考志愿推演。你的成绩是620分，全省5000名。现在，你需要做出人生第一个重大选择。',
      closing: '无论你选择什么，记住：专业会变，兴趣会变，但你在选择过程中培养的思考能力永远不会过时。',
      transitions: [],
    },
  },
  {
    id: 'career',
    metadata: {
      id: 'career',
      name: '职业选择',
      nameEn: 'Career Choice',
      description: '25岁，站在职业发展的十字路口。大厂？创业？考公？每条路都有不同的风景。',
      category: 'career',
      difficulty: 'hard',
      duration: '50分钟',
      tags: ['职业', '发展', '选择', '职场'],
    },
    time: {
      startYear: 2024,
      granularity: 'month',
      defaultSpeed: 30,
    },
    characters: {
      protagonist: {
        initialState: {
          age: 25,
          personality: {
            openness: 0.6,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.4,
            riskTolerance: 0.5,
            values: {
              career: 0.8,
              family: 0.5,
              freedom: 0.6,
              security: 0.4,
              achievement: 0.7,
              harmony: 0.4,
            },
          },
          skills: ['技术', '沟通', '管理'],
          relationships: [],
          status: { happiness: 0.5, wealth: 50000 },
        },
        constraints: {
          maxBranches: 5,
          maxCheckpoints: 5,
        },
      },
      supporting: [
        { id: 'boss', name: '直属领导', role: 'mentor', personality: { openness: 0.5, conscientiousness: 0.8, extraversion: 0.6, agreeableness: 0.6, neuroticism: 0.3, riskTolerance: 0.4, values: { career: 0.9, family: 0.5, freedom: 0.4, security: 0.6, achievement: 0.8, harmony: 0.5 } }, background: '公司中层管理者，技术出身', interaction: { triggerConditions: [], dialogueStyle: '务实型', possibleTopics: ['晋升', '团队管理', '职业规划'] }, presence: { firstAppearance: 0, frequency: 1 } },
        { id: 'entrepreneur', name: '创业者老王', role: 'mentor', personality: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.4, neuroticism: 0.3, riskTolerance: 0.9, values: { career: 0.9, family: 0.3, freedom: 0.9, security: 0.2, achievement: 0.9, harmony: 0.3 } }, background: '连续创业者，已卖掉两家公司', interaction: { triggerConditions: [], dialogueStyle: '激励型', possibleTopics: ['创业经历', '融资', '团队建设'] }, presence: { firstAppearance: 0, frequency: 1 } },
        { id: 'gwy', name: '公务员小李', role: 'friend', personality: { openness: 0.4, conscientiousness: 0.7, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.3, riskTolerance: 0.3, values: { career: 0.6, family: 0.8, freedom: 0.3, security: 0.9, achievement: 0.5, harmony: 0.8 } }, background: '省直机关公务员，工作5年', interaction: { triggerConditions: [], dialogueStyle: '分享型', possibleTopics: ['体制内生活', '薪资待遇', '发展前景'] }, presence: { firstAppearance: 0, frequency: 1 } },
      ],
      historical: ['zhang-yiming', 'ren-zhengfei'],
    },
    eventLibrary: {
      milestones: [
        { id: 'crossroads', name: '职业十字路口', month: 0, type: 'milestone', description: '收到多份offer，需要做出选择', impact: {}, nextDecision: 'choose_path' },
        { id: 'first_year', name: '第一年工作', month: 3, type: 'milestone', description: '在新环境中适应，寻找自己的定位', impact: { character: 0.08 } },
        { id: 'mid_career', name: '中期发展', month: 12, type: 'milestone', description: '职业发展遇到新机会或挑战', impact: {}, isFinal: true },
      ],
      random: [
        { id: 'bonus', name: '意外奖金', monthRange: [2, 10], weight: 0.2, effect: { wealth: 50000, happiness: 0.1 } },
        { id: 'layoff', name: '裁员风波', monthRange: [6, 18], weight: 0.15, effect: { happiness: -0.2, confidence: -0.1 } },
        { id: 'promotion', name: '晋升机会', monthRange: [8, 20], weight: 0.25, effect: { happiness: 0.15, wealth: 30000 } },
      ],
      encounters: [],
    },
    decisionLibrary: [
      {
        id: 'choose_path',
        trigger: { type: 'event', value: 'crossroads' },
        question: '摆在你面前的三条路，你选择哪一条？',
        context: '每条路都有不同的风景，也伴随着不同的挑战。想清楚你要什么样的人生。',
        options: [
          { id: 'bigtech', content: '加入大厂（年薪50万）', pros: ['薪资高', '平台大', '背书强'], cons: ['竞争激烈', '可能被裁', '工作强度大'], predicted: { characterChange: 0.05, successProbability: 0.7, riskLevel: 'medium' } },
          { id: 'startup', content: '加入创业公司（年薪20万+期权）', pros: ['成长快', '股权可能财务自由'], cons: ['风险高', '可能失败', '不稳定'], predicted: { characterChange: 0.12, successProbability: 0.4, riskLevel: 'high' } },
          { id: 'gongwu', content: '考公/考编（稳定为主）', pros: ['稳定', '社会地位', 'work-life balance'], cons: ['薪资增长慢', '晋升论资历'], predicted: { characterChange: 0.03, successProbability: 0.8, riskLevel: 'low' } },
          { id: 'ownstartup', content: '全职创业（九死一生）', pros: ['可能财务自由', '自己做主'], cons: ['成功率5%', '影响生活', '需要资金'], predicted: { characterChange: 0.15, successProbability: 0.2, riskLevel: 'high' } },
        ],
      },
    ],
    scripts: {
      opening: '欢迎来到职业选择推演。你25岁，刚刚研究生毕业，收到了多份offer。这是职业发展的关键节点。',
      closing: '职业没有好坏之分，只有适合与否。重要的是在选择后全力以赴，在过程中不断调整。',
      transitions: [],
    },
  },
  {
    id: 'startup',
    metadata: {
      id: 'startup',
      name: '创业之路',
      nameEn: 'Startup Journey',
      description: '带着你的想法，踏上创业征程。从MVP到融资，从产品迭代到团队管理，体验创业的起起落落。',
      category: 'adventure',
      difficulty: 'very_hard',
      duration: '60分钟',
      tags: ['创业', '融资', '团队', '产品'],
    },
    time: {
      startYear: 2024,
      granularity: 'month',
      defaultSpeed: 15,
    },
    characters: {
      protagonist: {
        initialState: {
          age: 28,
          personality: {
            openness: 0.7,
            conscientiousness: 0.6,
            extraversion: 0.6,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.8,
            values: {
              career: 0.9,
              family: 0.3,
              freedom: 0.9,
              security: 0.2,
              achievement: 0.9,
              harmony: 0.3,
            },
          },
          skills: ['技术', '产品', '融资'],
          relationships: [],
          status: { happiness: 0.6, wealth: 100000, teamSize: 2 },
        },
        constraints: {
          maxBranches: 5,
          maxCheckpoints: 5,
        },
      },
      supporting: [
        { id: 'cofounder', name: '联合创始人小张', role: 'partner', personality: { openness: 0.6, conscientiousness: 0.8, extraversion: 0.5, agreeableness: 0.6, neuroticism: 0.4, riskTolerance: 0.6, values: { career: 0.8, family: 0.4, freedom: 0.7, security: 0.3, achievement: 0.8, harmony: 0.5 } }, background: '技术合伙人，连续创业者', interaction: { triggerConditions: [], dialogueStyle: '技术导向型', possibleTopics: ['产品技术', '团队分工', '股权分配'] }, presence: { firstAppearance: 0, frequency: 1 } },
        { id: 'investor', name: '投资人陈总', role: 'mentor', personality: { openness: 0.6, conscientiousness: 0.7, extraversion: 0.7, agreeableness: 0.5, neuroticism: 0.2, riskTolerance: 0.7, values: { career: 0.9, family: 0.4, freedom: 0.6, security: 0.4, achievement: 0.9, harmony: 0.4 } }, background: '知名VC合伙人，投出多个独角兽', interaction: { triggerConditions: [], dialogueStyle: '商业分析型', possibleTopics: ['商业模式', '市场分析', '融资技巧'] }, presence: { firstAppearance: 0, frequency: 1 } },
      ],
      historical: ['musk', 'jobs'],
    },
    eventLibrary: {
      milestones: [
        { id: 'idea', name: '灵感迸发', month: 0, type: 'milestone', description: '发现一个痛点，开始构思解决方案', impact: {}, nextDecision: 'validate_idea' },
        { id: 'mvp', name: 'MVP发布', month: 3, type: 'milestone', description: '第一个产品版本上线，开始验证市场', impact: { confidence: 0.1 } },
        { id: 'seed', name: '种子轮融资', month: 6, type: 'milestone', description: '获得第一笔融资，团队开始扩张', impact: { wealth: 500000 } },
        { id: 'pmf', name: '产品市场匹配', month: 12, type: 'milestone', description: '找到产品与市场的契合点，进入快速增长', impact: { happiness: 0.2 } },
        { id: 'series_a', name: 'A轮融资', month: 18, type: 'milestone', description: '规模化发展，成为行业竞争者', impact: {}, isFinal: true },
      ],
      random: [
        { id: 'pivot', name: '关键转型', monthRange: [4, 8], weight: 0.2, effect: { character: 0.1 } },
        { id: 'cofounder_leave', name: '联合创始人离开', monthRange: [6, 12], weight: 0.15, effect: { happiness: -0.15, confidence: -0.1 } },
        { id: 'competitor', name: '竞争对手融资', monthRange: [8, 15], weight: 0.25, effect: { confidence: -0.1 } },
        { id: 'viral', name: '产品病毒式增长', monthRange: [10, 16], weight: 0.1, effect: { happiness: 0.2, wealth: 1000000 } },
      ],
      encounters: [],
    },
    decisionLibrary: [
      {
        id: 'validate_idea',
        trigger: { type: 'event', value: 'idea' },
        question: '你的创业想法已经成型，如何迈出第一步？',
        context: '创业的第一步往往决定后续发展轨迹。想清楚你要解决什么问题，为谁解决这个问题。',
        options: [
          { id: 'mvp_first', content: '先做MVP验证（低成本试错）', pros: ['成本低', '快速迭代', '失败损失小'], cons: ['产品可能不完善', '难以演示'], predicted: { characterChange: 0.08, successProbability: 0.7, riskLevel: 'low' } },
          { id: 'research_first', content: '先做市场调研（深度研究）', pros: ['方向更清晰', '数据支撑'], cons: ['耗时较长', '可能错过时机'], predicted: { characterChange: 0.05, successProbability: 0.6, riskLevel: 'medium' } },
          { id: 'funding_first', content: '先找融资再做事', pros: ['资金充裕', '快速启动'], cons: ['难度大', '可能被稀释'], predicted: { characterChange: 0.1, successProbability: 0.4, riskLevel: 'high' } },
        ],
      },
      {
        id: 'seed_decision',
        trigger: { type: 'event', value: 'seed' },
        question: '获得多家投资机构的青睐，如何选择？',
        context: '不同的投资人带来的不仅是钱，还有资源、人脉和指导。选择比估值更重要。',
        options: [
          { id: 'big_vc', content: '选择知名VC（资源多）', pros: ['品牌背书', '资源丰富', '后续融资容易'], cons: ['要求高', '可能干预运营'], predicted: { characterChange: 0.05, successProbability: 0.7, riskLevel: 'medium' } },
          { id: 'angel', content: '选择战略投资人（产业资源）', pros: ['产业资源', '客户资源'], cons: ['可能失去独立性'], predicted: { characterChange: 0.08, successProbability: 0.65, riskLevel: 'medium' } },
          { id: 'all_in', content: '全部接受（分散风险）', pros: ['资金充足', '关系分散'], cons: ['股权稀释多', '决策复杂'], predicted: { characterChange: 0.03, successProbability: 0.6, riskLevel: 'low' } },
        ],
      },
    ],
    scripts: {
      opening: '欢迎来到创业之路。你有一个想法，渴望改变世界。但创业维艰，九死一生。你准备好了吗？',
      closing: '无论成败，创业经历都是一笔财富。它会让你更了解自己，更理解商业世界。',
      transitions: [],
    },
  },
  {
    id: 'parallel-life',
    metadata: {
      id: 'parallel-life',
      name: '平行人生',
      nameEn: 'Parallel Life',
      description: '与其他用户的Agent分身一起体验人生。在大学里组队学习，在职场中互相支持，在创业路上并肩作战。',
      category: 'relationship',
      difficulty: 'medium',
      duration: '40分钟',
      tags: ['社交', '组队', '协作', '成长'],
    },
    time: {
      startYear: 2024,
      granularity: 'month',
      defaultSpeed: 45,
    },
    characters: {
      protagonist: {
        initialState: {
          age: 18,
          personality: {
            openness: 0.6,
            conscientiousness: 0.6,
            extraversion: 0.6,
            agreeableness: 0.7,
            neuroticism: 0.4,
            riskTolerance: 0.5,
            values: {
              career: 0.6,
              family: 0.5,
              freedom: 0.5,
              security: 0.5,
              achievement: 0.6,
              harmony: 0.7,
            },
          },
          skills: ['学习', '沟通', '协作'],
          relationships: [],
          status: { happiness: 0.7, confidence: 0.5 },
        },
        constraints: {
          maxBranches: 3,
          maxCheckpoints: 3,
        },
      },
      supporting: [
        { id: 'roommate', name: '室友小美', role: 'friend', personality: { openness: 0.7, conscientiousness: 0.5, extraversion: 0.8, agreeableness: 0.8, neuroticism: 0.3, riskTolerance: 0.6, values: { career: 0.7, family: 0.6, freedom: 0.6, security: 0.4, achievement: 0.7, harmony: 0.6 } }, background: '你的大学室友，来自南方城市', interaction: { triggerConditions: [], dialogueStyle: '活泼型', possibleTopics: ['校园生活', '学习方法', '未来规划'] }, presence: { firstAppearance: 0, frequency: 1 } },
        { id: 'studypartner', name: '学习伙伴阿强', role: 'partner', personality: { openness: 0.5, conscientiousness: 0.9, extraversion: 0.4, agreeableness: 0.6, neuroticism: 0.3, riskTolerance: 0.4, values: { career: 0.8, family: 0.4, freedom: 0.4, security: 0.6, achievement: 0.9, harmony: 0.5 } }, background: '学霸一枚，每年奖学金获得者', interaction: { triggerConditions: [], dialogueStyle: '认真型', possibleTopics: ['学习方法', '考试技巧', '科研项目'] }, presence: { firstAppearance: 0, frequency: 1 } },
        { id: 'clubmember', name: '社团朋友小林', role: 'friend', personality: { openness: 0.8, conscientiousness: 0.5, extraversion: 0.9, agreeableness: 0.7, neuroticism: 0.3, riskTolerance: 0.7, values: { career: 0.6, family: 0.5, freedom: 0.8, security: 0.3, achievement: 0.6, harmony: 0.6 } }, background: '学生会骨干，人脉广泛', interaction: { triggerConditions: [], dialogueStyle: '热情型', possibleTopics: ['社团活动', '人脉经营', '职业发展'] }, presence: { firstAppearance: 0, frequency: 1 } },
      ],
      historical: [],
    },
    eventLibrary: {
      milestones: [
        { id: 'freshman_start', name: '大学开始', month: 0, type: 'milestone', description: '踏入大学校门，结识来自五湖四海的同学', impact: {}, nextDecision: 'join_club' },
        { id: 'first_semester', name: '第一学期结束', month: 6, type: 'milestone', description: '学期结束，与室友和同学建立深厚友谊', impact: { character: 0.05 } },
        { id: 'summer_intern', name: '暑假实习', month: 12, type: 'milestone', description: '通过社团朋友的推荐，获得第一个实习机会', impact: { confidence: 0.1, character: 0.1 } },
        { id: 'graduation', name: '毕业季', month: 48, type: 'milestone', description: '四年大学生活结束，大家各奔东西', impact: {}, isFinal: true },
      ],
      random: [
        { id: 'birthday_party', name: '生日派对', monthRange: [3, 10], weight: 0.3, effect: { happiness: 0.1, character: 0.05 } },
        { id: 'team_project', name: '组队项目', monthRange: [4, 15], weight: 0.4, effect: { character: 0.1, confidence: 0.05 } },
        { id: 'conflict', name: '室友矛盾', monthRange: [6, 20], weight: 0.15, effect: { happiness: -0.1, character: -0.05 } },
        { id: 'help_received', name: '朋友帮助', monthRange: [8, 25], weight: 0.25, effect: { confidence: 0.1, happiness: 0.1 } },
      ],
      encounters: [],
    },
    decisionLibrary: [
      {
        id: 'join_club',
        trigger: { type: 'event', value: 'freshman_start' },
        question: '室友邀请你加入学生会，但你对创业社团更感兴趣。你怎么选？',
        context: '大学是建立人脉的关键时期，不同的选择会结识不同的朋友',
        options: [
          { id: 'student_union', content: '加入学生会（人脉广）', pros: ['人脉资源丰富', '锻炼组织能力', '容易获得信息'], cons: ['事务繁忙', '可能影响学习'], predicted: { characterChange: 0.08, successProbability: 0.7, riskLevel: 'low' } },
          { id: 'startup_club', content: '加入创业社团（找志同道合者）', pros: ['可能遇到合伙人', '了解创业信息'], cons: ['圈子较小', '风险较高'], predicted: { characterChange: 0.12, successProbability: 0.5, riskLevel: 'medium' } },
          { id: 'both', content: '两个都加入（会很忙）', pros: ['两边资源都能用', '全面体验'], cons: ['时间紧张', '可能都做不好'], predicted: { characterChange: 0.05, successProbability: 0.4, riskLevel: 'medium' } },
        ],
      },
      {
        id: 'intern_choice',
        trigger: { type: 'event', value: 'first_semester' },
        question: '暑假实习机会来了，两个选择摆在你面前：',
        context: '实习是进入职场的第一步，选择可能影响未来的职业方向',
        options: [
          { id: 'big_company', content: '大厂实习（有名气）', pros: ['简历好看', '流程规范', '大厂视角'], cons: ['螺丝钉', '竞争激烈'], predicted: { characterChange: 0.05, successProbability: 0.6, riskLevel: 'low' } },
          { id: 'startup', content: '创业公司实习（全栈经验）', pros: ['参与度高', '成长快', '可能拿到offer'], cons: ['风险高', '不稳定'], predicted: { characterChange: 0.1, successProbability: 0.4, riskLevel: 'high' } },
          { id: 'research', content: '跟导师做科研', pros: ['论文机会', '学术人脉', '深造基础'], cons: ['收入低', '可能发现不喜欢科研'], predicted: { characterChange: 0.08, successProbability: 0.55, riskLevel: 'low' } },
        ],
      },
    ],
    scripts: {
      opening: '欢迎来到平行人生。你的室友小美正在宿舍门口等你，\"快来选社团啦！\" 大学四年，你将和一群有趣的人一起成长。',
      closing: '大学不仅是学知识的地方，更是建立一生友谊的起点。那些和你一起熬夜打游戏、一起准备考试的朋友，可能会是你未来最重要的伙伴。',
      transitions: [],
    },
  },
];
