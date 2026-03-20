import { NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/lib/auth';

export async function POST() {
  const baseUrl = process.env.SECONDME_REDIRECT_URI?.replace('/api/auth/callback', '') || 'http://localhost:3000';
  const response = NextResponse.redirect(new URL('/', baseUrl));

  response.cookies.delete(AUTH_COOKIES.TOKEN);
  response.cookies.delete(AUTH_COOKIES.USER);

  return response;
}
