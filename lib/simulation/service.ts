import {
  Simulation,
  SimulationState,
  Timeline,
  TimelineEvent,
  Branch,
  Checkpoint,
  DecisionRecord,
  DecisionOutcome,
  SimulationStatus,
  SimulationConfig,
  ProtagonistState,
  EventImpact,
} from './types';
import { getScene, Scene } from '@/lib/scenes';
import { generateId } from '@/lib/a2a/service';

// In-memory simulation storage (replace with database in production)
const simulations = new Map<string, Simulation>();

export function createSimulation(
  userId: string,
  sceneId: string,
  config: Partial<SimulationConfig> = {}
): Simulation | null {
  const scene = getScene(sceneId);
  if (!scene) return null;

  const now = new Date();
  const defaultConfig: SimulationConfig = {
    startDate: new Date(scene.time.startYear, 0, 1),
    endDate: scene.time.endYear ? new Date(scene.time.endYear, 0, 1) : undefined,
    speed: scene.time.defaultSpeed,
    granularity: scene.time.granularity,
    autoSave: true,
    maxBranches: scene.characters.protagonist.constraints.maxBranches ?? 5,
    maxCheckpoints: scene.characters.protagonist.constraints.maxCheckpoints ?? 5,
    ...config,
  };

  const simulation: Simulation = {
    id: generateId(),
    userId,
    sceneId,
    status: 'draft',
    config: defaultConfig,
    state: createInitialState(scene, defaultConfig.startDate),
    timeline: {
      id: generateId(),
      epochs: [],
      events: [],
      decisions: [],
    },
    branches: [
      {
        id: generateId(),
        parentBranchId: null,
        decisionPointId: '',
        path: [],
        stats: { eventCount: 0 },
        status: 'active',
        createdAt: now,
      },
    ],
    checkpoints: [],
    createdAt: now,
    updatedAt: now,
  };

  // Set initial branch as current
  simulation.state.currentBranchId = simulation.branches[0].id;

  simulations.set(simulation.id, simulation);
  return simulation;
}

function createInitialState(scene: Scene, startDate: Date): SimulationState {
  const protagonist: ProtagonistState = {
    age: scene.characters.protagonist.initialState.age,
    personality: scene.characters.protagonist.initialState.personality,
    skills: [...scene.characters.protagonist.initialState.skills],
    relationships: scene.characters.protagonist.initialState.relationships.map((r) => ({
      ...r,
      events: [],
    })),
    status: { ...scene.characters.protagonist.initialState.status },
  };

  return {
    currentDate: startDate,
    currentEpoch: '',
    currentBranchId: '',
    position: 0,
    protagonist,
    stats: {
      eventCount: 0,
      decisionCount: 0,
      a2aInteractionCount: 0,
      branchCount: 1,
      checkpointCount: 0,
    },
  };
}

export function getSimulation(simulationId: string): Simulation | undefined {
  return simulations.get(simulationId);
}

export function getUserSimulations(userId: string): Simulation[] {
  return Array.from(simulations.values()).filter((s) => s.userId === userId);
}

export function updateSimulationStatus(
  simulationId: string,
  status: SimulationStatus
): Simulation | undefined {
  const sim = simulations.get(simulationId);
  if (!sim) return undefined;

  sim.status = status;
  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return sim;
}

export function addTimelineEvent(
  simulationId: string,
  event: Omit<TimelineEvent, 'id' | 'sequence' | 'branchId'>
): TimelineEvent | undefined {
  const sim = simulations.get(simulationId);
  if (!sim) return undefined;

  const newEvent: TimelineEvent = {
    ...event,
    id: generateId(),
    sequence: sim.timeline.events.length + 1,
    branchId: sim.state.currentBranchId,
  };

  sim.timeline.events.push(newEvent);

  // Update branch path
  const currentBranch = sim.branches.find((b) => b.id === sim.state.currentBranchId);
  if (currentBranch) {
    currentBranch.path.push(newEvent.id);
    currentBranch.stats.eventCount++;
  }

  // Apply event impact to protagonist
  if (event.impact) {
    applyImpact(sim, event.impact);
  }

  // Update stats
  sim.state.stats.eventCount++;
  if (event.type === 'a2a') {
    sim.state.stats.a2aInteractionCount++;
  }

  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return newEvent;
}

function applyImpact(sim: Simulation, impact: EventImpact): void {
  if (impact.character !== undefined) {
    // Update personality openness as a simple metric
    sim.state.protagonist.personality.openness = Math.min(
      1,
      Math.max(0, sim.state.protagonist.personality.openness + impact.character * 0.1)
    );
  }

  if (impact.happiness !== undefined) {
    (sim.state.protagonist.status.happiness as number) =
      Math.min(1, Math.max(0, (sim.state.protagonist.status.happiness as number ?? 0.5) + impact.happiness));
  }

  if (impact.confidence !== undefined) {
    (sim.state.protagonist.status.confidence as number) =
      Math.min(1, Math.max(0, (sim.state.protagonist.status.confidence as number ?? 0.5) + impact.confidence));
  }

  if (impact.relationship) {
    for (const [name, change] of Object.entries(impact.relationship)) {
      const rel = sim.state.protagonist.relationships.find((r) => r.name === name);
      if (rel) {
        rel.closeness = Math.min(1, Math.max(0, rel.closeness + change * 0.1));
      }
    }
  }
}

export function addDecision(
  simulationId: string,
  decision: Omit<DecisionRecord, 'id' | 'branchId' | 'chosenOptionId' | 'chosenAt' | 'outcome'>
): DecisionRecord | undefined {
  const sim = simulations.get(simulationId);
  if (!sim) return undefined;

  const newDecision: DecisionRecord = {
    ...decision,
    id: generateId(),
    branchId: sim.state.currentBranchId,
  };

  sim.timeline.decisions.push(newDecision);
  sim.state.stats.decisionCount++;
  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return newDecision;
}

export function makeDecision(
  simulationId: string,
  decisionId: string,
  optionId: string
): DecisionRecord | undefined {
  const sim = simulations.get(simulationId);
  if (!sim) return undefined;

  const decision = sim.timeline.decisions.find((d) => d.id === decisionId);
  if (!decision) return undefined;

  const option = decision.options.find((o) => o.id === optionId);
  if (!option) return undefined;

  decision.chosenOptionId = optionId;
  decision.chosenAt = new Date();

  // Generate outcome
  decision.outcome = generateOutcome(decision, option);

  // Apply effects
  if (option.effects) {
    applyImpact(sim, option.effects);
  }

  // Create new branch if needed (for major decisions)
  // For MVP, we just mark the current branch
  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return decision;
}

function generateOutcome(
  decision: DecisionRecord,
  option: DecisionRecord['options'][0]
): DecisionOutcome {
  const success = Math.random() < option.predicted.successProbability;

  return {
    immediate: success
      ? `你选择了"${option.content}"，这个选择带来了积极的结果。`
      : `你选择了"${option.content}"，短期内遇到了一些挑战。`,
    shortTerm: success
      ? '这个选择在短期内显示出了它的价值。'
      : '你需要调整策略来应对挑战。',
    longTerm: success
      ? '从长远来看，这个选择塑造了更好的人生轨迹。'
      : '虽然过程曲折，但你也从中获得了宝贵的经验。',
    actualImpact: {
      character: option.predicted.characterChange * (success ? 1 : -0.5),
      happiness: success ? 0.1 : -0.05,
      confidence: success ? 0.05 : -0.1,
    },
    narrative: decision.context + ' ' + (success ? '你的选择被证明是明智的。' : '这个选择需要更多的努力来弥补。'),
  };
}

export function createCheckpoint(
  simulationId: string,
  name: string,
  description?: string
): Checkpoint | undefined {
  const sim = simulations.get(simulationId);
  if (!sim) return undefined;

  if (sim.checkpoints.length >= sim.config.maxCheckpoints) {
    // Remove oldest checkpoint
    sim.checkpoints.shift();
  }

  const checkpoint: Checkpoint = {
    id: generateId(),
    simulationId,
    branchId: sim.state.currentBranchId,
    name,
    description,
    snapshot: {
      date: sim.state.currentDate,
      epochId: sim.state.currentEpoch,
      state: JSON.parse(JSON.stringify(sim.state)),
      events: JSON.parse(JSON.stringify(sim.timeline.events)),
      decisions: JSON.parse(JSON.stringify(sim.timeline.decisions)),
    },
    createdAt: new Date(),
  };

  sim.checkpoints.push(checkpoint);
  sim.state.stats.checkpointCount++;
  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return checkpoint;
}

export function rollbackToCheckpoint(
  simulationId: string,
  checkpointId: string
): Simulation | undefined {
  const sim = simulations.get(simulationId);
  if (!sim) return undefined;

  const checkpoint = sim.checkpoints.find((c) => c.id === checkpointId);
  if (!checkpoint) return undefined;

  // Restore state
  sim.state = JSON.parse(JSON.stringify(checkpoint.snapshot.state));
  sim.state.currentBranchId = checkpoint.branchId;

  // Restore events and decisions up to checkpoint
  sim.timeline.events = JSON.parse(JSON.stringify(checkpoint.snapshot.events));
  sim.timeline.decisions = JSON.parse(JSON.stringify(checkpoint.snapshot.decisions));

  // Mark current branch as active
  const currentBranch = sim.branches.find((b) => b.id === sim.state.currentBranchId);
  if (currentBranch) {
    currentBranch.status = 'active';
  }

  // Create new branch from checkpoint
  const newBranch: Branch = {
    id: generateId(),
    parentBranchId: checkpoint.branchId,
    decisionPointId: '',
    path: [...checkpoint.snapshot.events.map((e) => e.id)],
    stats: { eventCount: checkpoint.snapshot.events.length },
    status: 'active',
    createdAt: new Date(),
  };

  sim.branches.push(newBranch);
  sim.state.currentBranchId = newBranch.id;
  sim.state.stats.branchCount++;

  // Mark parent branch as abandoned
  const parentBranch = sim.branches.find((b) => b.id === checkpoint.branchId);
  if (parentBranch) {
    parentBranch.status = 'abandoned';
  }

  sim.status = 'running';
  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return sim;
}

export function advanceTime(simulationId: string, delta: number): Simulation | undefined {
  const sim = simulations.get(simulationId);
  if (!sim || sim.status !== 'running') return undefined;

  // Calculate new date based on granularity and speed
  const newDate = new Date(sim.state.currentDate);

  switch (sim.config.granularity) {
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + delta);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + delta);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + delta * 7);
      break;
  }

  sim.state.currentDate = newDate;
  sim.updatedAt = new Date();
  simulations.set(simulationId, sim);
  return sim;
}

export function getSimulationTimeline(simulationId: string): Timeline | undefined {
  return simulations.get(simulationId)?.timeline;
}

export function getSimulationBranches(simulationId: string): Branch[] {
  return simulations.get(simulationId)?.branches ?? [];
}
