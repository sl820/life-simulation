import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getSimulation, addDecision, makeDecision } from '@/lib/simulation';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/simulation/[id]/decision - Create or make decision
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { decisionId, optionId, ...newDecision } = body;

    const sim = getSimulation(id);
    if (!sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    if (decisionId && optionId) {
      // Make decision
      const decision = makeDecision(id, decisionId, optionId);
      if (!decision) {
        return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
      }
      return NextResponse.json({ decision });
    } else if (newDecision.question) {
      // Create decision
      const decision = addDecision(id, {
        ...newDecision,
        virtualDate: new Date(),
      });
      return NextResponse.json({ decision });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Decision error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
