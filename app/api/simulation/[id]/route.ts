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

    return NextResponse.json({
      simulation: {
        id: sim.id,
        sceneId: sim.sceneId,
        status: sim.status,
        config: sim.config,
        state: sim.state,
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
    const { action, data } = body;

    const sim = getSimulation(id);
    if (!sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    switch (action) {
      case 'start':
        updateSimulationStatus(id, 'running');
        break;
      case 'pause':
        updateSimulationStatus(id, 'paused');
        break;
      case 'resume':
        updateSimulationStatus(id, 'running');
        break;
      case 'complete':
        updateSimulationStatus(id, 'completed');
        break;
      case 'advance':
        if (data?.delta) {
          advanceTime(id, data.delta);
        }
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const updatedSim = getSimulation(id);
    return NextResponse.json({ simulation: updatedSim });
  } catch (error) {
    console.error('Update simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
