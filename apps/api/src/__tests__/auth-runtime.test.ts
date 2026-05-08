import { describe, expect, it } from 'vitest';
import {
  buildAuthRequestUrl,
  parseAllowedOrigins,
  resolveAuthBaseURL,
} from '../config/auth-runtime.js';

describe('auth runtime config', () => {
  it('trims and removes empty allowed origins from env values', () => {
    expect(parseAllowedOrigins(' https://app.captionlint.com, https://captionlint.com ,, ')).toEqual([
      'https://app.captionlint.com',
      'https://captionlint.com',
    ]);
  });

  it('falls back to the local web origin when allowed origins are not configured', () => {
    expect(parseAllowedOrigins(undefined)).toEqual(['http://localhost:3000']);
    expect(parseAllowedOrigins(' , ')).toEqual(['http://localhost:3000']);
  });

  it('uses the configured Better Auth base URL when available', () => {
    expect(resolveAuthBaseURL('https://api.captionlint.com')).toBe('https://api.captionlint.com');
  });

  it('builds Better Auth request URLs from Railway forwarded headers', () => {
    const url = buildAuthRequestUrl('/api/auth/callback/google?code=abc', {
      host: 'internal.railway.app',
      'x-forwarded-host': 'api.captionlint.com',
      'x-forwarded-proto': 'https',
    });

    expect(url.toString()).toBe('https://api.captionlint.com/api/auth/callback/google?code=abc');
  });

  it('prefers BETTER_AUTH_URL over proxy headers for canonical production redirects', () => {
    const url = buildAuthRequestUrl(
      '/api/auth/sign-in/social',
      {
        host: 'internal.railway.app',
        'x-forwarded-host': 'captionlint-api.up.railway.app',
        'x-forwarded-proto': 'https',
      },
      'https://api.captionlint.com',
    );

    expect(url.toString()).toBe('https://api.captionlint.com/api/auth/sign-in/social');
  });
});
