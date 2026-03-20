import { NextRequest, NextResponse } from 'next/server';
import { getAgentConversations, registerAgent } from '@/lib/a2a';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/a2a/conversations - Get user's conversations
export async function GET(request: NextRequest) {
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

    // Register user agent
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

    // Get conversations
    const conversations = getAgentConversations(userAgentId);

    return NextResponse.json({
      conversations: conversations.map((conv) => ({
        id: conv.id,
        participants: conv.participants.map((p) => ({
          agentId: p.agentId,
          agentType: p.agentType,
          name: p.name,
        })),
        lastMessage: conv.lastMessage
          ? {
              id: conv.lastMessage.id,
              content: conv.lastMessage.content,
              timestamp: conv.lastMessage.timestamp,
              from: conv.lastMessage.from,
            }
          : null,
        messageCount: conv.messages.length,
        updatedAt: conv.updatedAt,
      })),
    });
  } catch (error) {
    console.error('A2A conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
