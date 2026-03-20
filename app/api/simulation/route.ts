import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  createSimulation,
  getSimulation,
  getUserSimulations,
  updateSimulationStatus,
} from '@/lib/simulation';
import { getSceneMetadata } from '@/lib/scenes';

// POST /api/simulation - Create new simulation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sceneId, config } = body;

    if (!sceneId) {
      return NextResponse.json({ error: 'Missing sceneId' }, { status: 400 });
    }

    // Get user from cookie
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(AUTH_COOKIES.USER);

    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userProfile;
    try {
      userProfile = JSON.parse(userCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const userId = `user-${userProfile.originRoute || userProfile.name}`;
    const simulation = createSimulation(userId, sceneId, config);

    if (!simulation) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    return NextResponse.json({
      simulation: {
        id: simulation.id,
        sceneId: simulation.sceneId,
        status: simulation.status,
        createdAt: simulation.createdAt,
      },
    });
  } catch (error) {
    console.error('Create simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/simulation - Get user's simulations
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(AUTH_COOKIES.USER);

    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userProfile;
    try {
      userProfile = JSON.parse(userCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const userId = `user-${userProfile.originRoute || userProfile.name}`;
    const simulations = getUserSimulations(userId);

    return NextResponse.json({
      simulations: simulations.map((s) => ({
        id: s.id,
        sceneId: s.sceneId,
        status: s.status,
        currentDate: s.state.currentDate,
        stats: s.state.stats,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get simulations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
