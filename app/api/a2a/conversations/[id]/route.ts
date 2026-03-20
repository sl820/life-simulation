import { NextRequest, NextResponse } from 'next/server';
import { getConversation, getConversationMessages } from '@/lib/a2a';
import { AUTH_COOKIES } from '@/lib/auth';
import { cookies } from 'next/headers';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/a2a/conversations/[id] - Get conversation messages
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before') || undefined;

    const cookieStore = await cookies();
    const userCookie = cookieStore.get(AUTH_COOKIES.USER);

    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const conversation = getConversation(id);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = getConversationMessages(id, limit, before);

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participants: conversation.participants,
        messages: messages.map((m) => ({
          id: m.id,
          type: m.type,
          from: m.from,
          to: m.to,
          content: m.content,
          timestamp: m.timestamp,
        })),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error('A2A conversation detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
