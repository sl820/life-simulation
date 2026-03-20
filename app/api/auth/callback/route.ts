import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserProfile, AUTH_COOKIES, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);

    if (tokenResponse.code !== 0 || !tokenResponse.data?.accessToken) {
      return NextResponse.json(
        { error: 'Failed to exchange code for token' },
        { status: 400 }
      );
    }

    const accessToken = tokenResponse.data.accessToken;
    const profileResponse = await getUserProfile(accessToken);

    if (profileResponse.code !== 0) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 400 }
      );
    }

    const response = NextResponse.redirect(new URL('/', request.url));

    response.cookies.set(AUTH_COOKIES.TOKEN, accessToken, AUTH_COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIES.USER, JSON.stringify(profileResponse.data), AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
