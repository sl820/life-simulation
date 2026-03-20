// Cookie names - single source of truth
export const AUTH_COOKIES = {
  TOKEN: 'sm_token',
  USER: 'sm_user',
} as const;

// Cookie options - single source of truth
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// User profile type
export interface SecondMeProfile {
  name: string;
  avatar: string;
  aboutMe: string;
  originRoute: string;
  homepage: string;
}

// API response types
interface ApiResponse<T> {
  code: number;
  data: T;
}

interface TokenData {
  accessToken: string;
  tokenType: string;
}

interface ProfileData extends SecondMeProfile {}

// Fetch with validation
async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function exchangeCodeForToken(code: string): Promise<ApiResponse<TokenData>> {
  return fetchJson<TokenData>(process.env.SECONDME_TOKEN_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}

export async function getUserProfile(accessToken: string): Promise<ApiResponse<ProfileData>> {
  return fetchJson<ProfileData>(process.env.SECONDME_PROFILE_URL!, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID!,
    redirect: '1',
  });
  return `${process.env.SECONDME_AUTH_URL}?${params.toString()}`;
}

// Re-export type for convenience
export type { SecondMeProfile as UserProfile };
