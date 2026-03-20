// Shared Types across the application

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface ApiError {
  code: number;
  message: string;
  detail?: unknown;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// User Types
export interface User {
  id: string;
  secondMeId?: string;
  name: string;
  avatar?: string;
  aboutMe?: string;
  originRoute?: string;
  homepage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// Common Types
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface Identifiable {
  id: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

export type ISO8601Date = string;

export function toISO8601(date: Date): ISO8601Date {
  return date.toISOString();
}

export function fromISO8601(iso: ISO8601Date): Date {
  return new Date(iso);
}
