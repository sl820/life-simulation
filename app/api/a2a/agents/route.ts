import { NextRequest, NextResponse } from 'next/server';
import { discoverAgents, historicalFigures, registerAgent, getAgent } from '@/lib/a2a';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/a2a/agents - List available agents
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'user' | 'historical' | null;
  const scene = searchParams.get('scene');

  // Get current user from cookie
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(AUTH_COOKIES.USER);

  let userProfile = null;
  if (userCookie) {
    try {
      userProfile = JSON.parse(userCookie.value);
    } catch {
      // ignore
    }
  }

  // Register current user as an agent if logged in
  if (userProfile) {
    registerAgent({
      id: `user-${userProfile.originRoute || userProfile.name}`,
      name: userProfile.name,
      avatar: userProfile.avatar,
      type: 'user',
      personality: undefined, // Would come from SecondMe profile
      aboutMe: userProfile.aboutMe,
      originRoute: userProfile.originRoute,
      status: 'online',
      lastActiveAt: new Date(),
    });
  }

  // Get historical figures
  let agents = [...historicalFigures];

  // Add online user agents (from registry)
  // In production, this would query a database
  const url = searchParams.get('includeUsers') === 'true';

  if (url) {
    const { getOnlineAgents } = await import('@/lib/a2a');
    const onlineUsers = getOnlineAgents().filter((a) => a.type === 'user');
    agents = [...agents, ...onlineUsers];
  }

  // Filter by type
  if (type) {
    agents = agents.filter((a) => a.type === type);
  }

  // Filter by scene relevance (simplified)
  if (scene) {
    // In production, would use more sophisticated matching
    agents = agents.filter((a) => {
      if (a.type === 'historical') return true; // Historical figures are always relevant
      return true;
    });
  }

  return NextResponse.json({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      avatar: a.avatar,
      type: a.type,
      aboutMe: a.aboutMe,
      status: a.status,
    })),
  });
}
