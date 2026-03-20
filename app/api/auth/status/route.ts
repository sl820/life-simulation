import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIES.TOKEN);
  const user = cookieStore.get(AUTH_COOKIES.USER);

  if (!token || !user) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    return NextResponse.json({
      authenticated: true,
      user: JSON.parse(user.value),
    });
  } catch {
    console.error('Failed to parse user cookie');
    return NextResponse.json({ authenticated: false });
  }
}
