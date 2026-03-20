import {
  AnalysisReport,
  ReportMeta,
  ReportVisualizations,
  ReportInsights,
  ReportRecommendations,
  PersonalityChart,
  DecisionInsight,
} from './types';
import { Simulation, TimelineEvent, DecisionRecord, Branch } from '@/lib/simulation/types';
import { getScene } from '@/lib/scenes';

export function generateAnalysisReport(simulation: Simulation): AnalysisReport {
  const scene = getScene(simulation.sceneId);

  const meta = generateMeta(simulation, scene?.metadata.name ?? '未知场景');
  const visualizations = generateVisualizations(simulation);
  const insights = generateInsights(simulation);
  const recommendations = generateRecommendations(simulation, insights);

  return {
    meta,
    visualizations,
    insights,
    recommendations,
  };
}

function generateMeta(sim: Simulation, sceneName: string): ReportMeta {
  const startDate = sim.config.startDate;
  const endDate = sim.state.currentDate;
  const durationMinutes = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  );

  return {
    simulationId: sim.id,
    sceneId: sim.sceneId,
    sceneName,
    duration: durationMinutes,
    branchCount: sim.branches.length,
    eventCount: sim.state.stats.eventCount,
    a2aInteractionCount: sim.state.stats.a2aInteractionCount,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

function generateVisualizations(sim: Simulation): ReportVisualizations {
  return {
    timeline: generateTimelineVisualization(sim),
    personalityChart: generatePersonalityChart(sim),
    branchTree: generateBranchTree(sim),
    knowledgeGraph: generateKnowledgeGraph(sim),
    a2aNetwork: generateA2ANetwork(sim),
  };
}

function generateTimelineVisualization(sim: Simulation): ReportVisualizations['timeline'] {
  const events = sim.timeline.events.map((e): ReportVisualizations['timeline']['events'][0] => ({
    id: e.id,
    date: e.virtualDate.toISOString(),
    title: e.title,
    type: e.type,
    branchId: e.branchId,
    impact: e.impact as Record<string, number> | undefined,
  }));

  const milestones = events.filter((e) => e.type === 'milestone').map((e) => e.id);

  const branches = sim.branches.map((b, i) => ({
    id: b.id,
    color: `hsl(${i * 60}, 70%, 50%)`,
  }));

  return { events, milestones, branches };
}

function generatePersonalityChart(sim: Simulation): PersonalityChart {
  const before = sim.branches[0]?.path.length === 0
    ? sim.state.protagonist.personality
    : { // This would need historical data - simplified for now
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
      riskTolerance: 0.5,
    };

  const after = sim.state.protagonist.personality;
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism', 'riskTolerance'] as const;

  const changes = traits.map((trait) => ({
    trait,
    before: before[trait],
    after: after[trait],
    change: ((after[trait] - before[trait]) / Math.max(before[trait], 0.1)) * 100,
  }));

  return { before, after, changes };
}

function generateBranchTree(sim: Simulation): ReportVisualizations['branchTree'] {
  const branches = sim.branches.map((b) => {
    const decision = sim.timeline.decisions.find((d) => d.id === b.decisionPointId);
    return {
      id: b.id,
      parentId: b.parentBranchId,
      label: decision?.question ?? '初始分支',
      decisionQuestion: decision?.question,
      chosenOption: decision?.chosenOptionId
        ? decision.options.find((o) => o.id === decision.chosenOptionId)?.content
        : undefined,
      outcome: decision?.outcome?.narrative,
      eventCount: b.stats.eventCount,
      stats: {
        finalHappiness: b.stats.finalHappiness,
        finalCharacter: b.stats.finalCharacter,
      },
    };
  });

  return {
    branches,
    rootId: sim.branches[0]?.id ?? '',
  };
}

function generateKnowledgeGraph(sim: Simulation): ReportVisualizations['knowledgeGraph'] {
  const nodes: ReportVisualizations['knowledgeGraph']['nodes'] = [];
  const edges: ReportVisualizations['knowledgeGraph']['edges'] = [];
  const skillSet = new Set<string>();
  const conceptSet = new Set<string>();

  for (const event of sim.timeline.events) {
    if (event.impact?.knowledge) {
      for (const k of event.impact.knowledge) {
        if (!skillSet.has(k)) {
          skillSet.add(k);
          nodes.push({
            id: `skill-${k}`,
            label: k,
            type: 'skill',
            acquired: event.virtualDate.toISOString(),
          });
        }
      }
    }
  }

  return { nodes, edges };
}

function generateA2ANetwork(sim: Simulation): ReportVisualizations['a2aNetwork'] {
  const nodes: ReportVisualizations['a2aNetwork']['nodes'] = [];
  const edges: ReportVisualizations['a2aNetwork']['edges'] = [];
  const agentInteractions = new Map<string, number>();

  for (const event of sim.timeline.events) {
    if (event.type === 'a2a' && event.a2aData?.participantIds) {
      for (const pid of event.a2aData.participantIds) {
        agentInteractions.set(pid, (agentInteractions.get(pid) ?? 0) + 1);
      }
    }
  }

  for (const [agentId, count] of agentInteractions) {
    nodes.push({
      id: agentId,
      name: agentId.includes('-') ? agentId.split('-')[1] : agentId,
      type: agentId.startsWith('user-') ? 'user' : 'historical',
      interactionCount: count,
    });
  }

  return { nodes, edges };
}

function generateInsights(sim: Simulation): ReportInsights {
  return {
    decision: generateDecisionInsight(sim),
    personality: generatePersonalityInsight(sim),
    a2a: generateA2AInsight(sim),
    knowledge: generateKnowledgeInsight(sim),
  };
}

function generateDecisionInsight(sim: Simulation): DecisionInsight {
  const decisions = sim.timeline.decisions;
  const decided = decisions.filter((d) => d.outcome);
  const successful = decided.filter((d) => d.outcome && d.outcome.actualImpact.happiness && d.outcome.actualImpact.happiness > 0);

  const keyPatterns: string[] = [];
  const avoidPatterns: string[] = [];

  // Analyze decision patterns
  const highRiskDecisions = decided.filter(
    (d) => d.options.find((o) => o.id === d.chosenOptionId)?.predicted.riskLevel === 'high'
  );
  if (highRiskDecisions.length > 0) {
    if (successful.length > highRiskDecisions.length / 2) {
      keyPatterns.push('你倾向于做出高风险决策，且往往能从中获益');
    } else {
      avoidPatterns.push('高风险决策的成功率有待提高，建议在重大决策前多收集信息');
    }
  }

  return {
    totalDecisions: decided.length,
    successfulDecisions: successful.length,
    successRate: decided.length > 0 ? successful.length / decided.length : 0,
    keyPatterns,
    avoidPatterns,
    mostInfluentialDecision: decided[0]
      ? {
          question: decided[0].question,
          impact: decided[0].outcome?.narrative ?? '',
        }
      : undefined,
  };
}

function generatePersonalityInsight(sim: Simulation): ReportInsights['personality'] {
  const personality = sim.state.protagonist.personality;
  const traits = Object.entries(personality).filter(
    ([key]) => !['values'].includes(key)
  ) as [string, number][];

  const sortedTraits = traits.sort((a, b) => Math.abs(b[1] - 0.5) - Math.abs(a[1] - 0.5));
  const mostChangedTrait = sortedTraits[0]?.[0] ?? 'openness';

  const growthAreas = traits.filter(([_, v]) => v > 0.6).map(([k]) => k);
  const strengths = growthAreas.slice(0, 2);
  const weaknesses = traits.filter(([_, v]) => v < 0.4).map(([k]) => k);

  return {
    mostChangedTrait,
    stabilityScore: 1 - Math.abs(personality.neuroticism - 0.5),
    growthAreas,
    strengths,
    weaknesses,
  };
}

function generateA2AInsight(sim: Simulation): ReportInsights['a2a'] {
  const a2aEvents = sim.timeline.events.filter((e) => e.type === 'a2a');

  return {
    totalInteractions: a2aEvents.length,
    conversationHighlights: a2aEvents.slice(0, 3).map((e) => ({
      participant: e.a2aData?.participantIds?.[0] ?? 'Unknown',
      quote: e.description,
      date: e.virtualDate.toISOString(),
    })),
  };
}

function generateKnowledgeInsight(sim: Simulation): ReportInsights['knowledge'] {
  const skills = new Set<string>();
  const concepts = new Set<string>();

  for (const event of sim.timeline.events) {
    if (event.impact?.knowledge) {
      for (const k of event.impact.knowledge) {
        skills.add(k);
      }
    }
  }

  return {
    skills: Array.from(skills),
    concepts: Array.from(concepts),
    relationships: [],
    values: [],
    growthAreas: [],
  };
}

function generateRecommendations(
  sim: Simulation,
  insights: ReportInsights
): ReportRecommendations {
  const recommendations: ReportRecommendations = {
    shortTerm: [],
    mediumTerm: [],
    longTerm: [],
  };

  // Based on personality insights
  if (insights.personality.growthAreas.includes('openness')) {
    recommendations.shortTerm.push('继续保持开放的心态，尝试新事物');
  }

  if (insights.personality.weaknesses.length > 0) {
    recommendations.shortTerm.push(`注意培养${insights.personality.weaknesses.join('、')}等特质`);
  }

  // Based on decision insights
  if (insights.decision.successRate < 0.5) {
    recommendations.mediumTerm.push('建议在重大决策前多收集信息，降低风险');
  } else {
    recommendations.mediumTerm.push('你的决策能力不错，可以尝试更具挑战性的选择');
  }

  // Based on A2A insights
  if (insights.a2a.totalInteractions > 5) {
    recommendations.mediumTerm.push('多与不同背景的人交流，拓宽视野');
  }

  // Long-term
  recommendations.longTerm.push('持续自我反思，明确长期人生目标');

  return recommendations;
}
