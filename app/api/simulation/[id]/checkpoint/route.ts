import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getSimulation, createCheckpoint, rollbackToCheckpoint } from '@/lib/simulation';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/simulation/[id]/checkpoint - Create checkpoint or rollback
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, checkpointId, name, description } = body;

    const sim = getSimulation(id);
    if (!sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    if (action === 'create') {
      if (!name) {
        return NextResponse.json({ error: 'Missing checkpoint name' }, { status: 400 });
      }
      const checkpoint = createCheckpoint(id, name, description);
      return NextResponse.json({ checkpoint });
    }

    if (action === 'rollback') {
      if (!checkpointId) {
        return NextResponse.json({ error: 'Missing checkpointId' }, { status: 400 });
      }
      const updatedSim = rollbackToCheckpoint(id, checkpointId);
      return NextResponse.json({ simulation: updatedSim });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Checkpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
