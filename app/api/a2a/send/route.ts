import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, getAgent, registerAgent } from '@/lib/a2a';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';
import { A2AContent } from '@/lib/a2a/types';

// POST /api/a2a/send - Send message to another agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toAgentId, content, conversationId } = body as {
      toAgentId: string;
      content: A2AContent;
      conversationId?: string;
    };

    if (!toAgentId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current user from cookie
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

    // Register or update user agent
    const userAgentId = `user-${userProfile.originRoute || userProfile.name}`;
    registerAgent({
      id: userAgentId,
      name: userProfile.name,
      avatar: userProfile.avatar,
      type: 'user',
      aboutMe: userProfile.aboutMe,
      originRoute: userProfile.originRoute,
      status: 'online',
      lastActiveAt: new Date(),
    });

    // Check if target agent exists
    const targetAgent = getAgent(toAgentId);
    if (!targetAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Send message
    const message = await sendMessage(userAgentId, toAgentId, content);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp,
        conversationId: message.conversationId,
      },
    });
  } catch (error) {
    console.error('A2A send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
