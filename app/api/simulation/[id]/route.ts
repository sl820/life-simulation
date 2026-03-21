import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  getSimulation,
  updateSimulationStatus,
  addTimelineEvent,
  addDecision,
  makeDecision,
  createCheckpoint,
  rollbackToCheckpoint,
  advanceTime,
  getSimulationTimeline,
  getSimulationBranches,
} from '@/lib/simulation';
import { getScene } from '@/lib/scenes';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/simulation/[id] - Get simulation details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const sim = getSimulation(id);
    if (!sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Check ownership
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(AUTH_COOKIES.USER);

    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get scene for decision templates
    const scene = getScene(sim.sceneId);
    const decisionTemplates = scene?.decisionLibrary || [];

    // Find pending decision (first decision without choice)
    const pendingDecision = sim.timeline.decisions.find((d) => !d.chosenOptionId);

    // Format events for timeline
    const events = sim.timeline.events.map((e) => ({
      id: e.id,
      title: e.title || `事件 ${e.sequence}`,
      description: e.description,
      type: e.type,
      virtualDate: e.virtualDate instanceof Date ? e.virtualDate.toISOString() : String(e.virtualDate),
      impact: e.impact,
      a2aData: e.a2aData,
    }));

    // Format current decision if exists
    let currentDecision = null;
    if (pendingDecision && scene) {
      const template = decisionTemplates.find((t) => t.id === pendingDecision.id || t.trigger.value === pendingDecision.id);
      if (template) {
        currentDecision = {
          id: pendingDecision.id,
          question: template.question,
          context: template.context,
          options: template.options.map((opt) => ({
            id: opt.id,
            content: opt.content,
            pros: opt.pros,
            cons: opt.cons,
            predicted: opt.predicted,
          })),
        };
      }
    }

    return NextResponse.json({
      simulation: {
        id: sim.id,
        sceneId: sim.sceneId,
        status: sim.status,
        currentDate: sim.state.currentDate instanceof Date ? sim.state.currentDate.toISOString() : String(sim.state.currentDate),
        position: sim.state.position,
        protagonist: {
          age: sim.state.protagonist.age,
          personality: sim.state.protagonist.personality,
          skills: sim.state.protagonist.skills,
          status: sim.state.protagonist.status,
        },
        stats: sim.state.stats,
        timeline: sim.timeline,
        branches: sim.branches,
        checkpoints: sim.checkpoints.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          createdAt: c.createdAt,
        })),
        createdAt: sim.createdAt,
        updatedAt: sim.updatedAt,
      },
      events,
      currentDecision,
    });
  } catch (error) {
    console.error('Get simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/simulation/[id] - Update simulation (status, etc)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const sim = getSimulation(id);
    if (!sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    let updatedSim = sim;
    if (status) {
      updatedSim = updateSimulationStatus(id, status) || sim;
    }

    return NextResponse.json({ simulation: updatedSim });
  } catch (error) {
    console.error('Update simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
