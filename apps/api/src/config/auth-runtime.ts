import type { IncomingHttpHeaders } from 'node:http';

const DEFAULT_AUTH_BASE_URL = 'http://localhost:4000';
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(',')[0]?.trim() || undefined;
}

export function parseAllowedOrigins(value: string | undefined): string[] {
  const origins =
    value
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  return origins.length > 0 ? origins : DEFAULT_ALLOWED_ORIGINS;
}

export function getTrustedOrigins(): string[] {
  return parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
}

export function resolveAuthBaseURL(value = process.env.BETTER_AUTH_URL): string {
  return value?.trim() || DEFAULT_AUTH_BASE_URL;
}

export function buildAuthRequestUrl(
  requestUrl: string,
  headers: IncomingHttpHeaders,
  baseURL = process.env.BETTER_AUTH_URL,
): URL {
  const configuredBaseURL = baseURL?.trim();

  if (configuredBaseURL) {
    return new URL(requestUrl, configuredBaseURL);
  }

  const forwardedHost = firstHeaderValue(headers['x-forwarded-host']);
  const forwardedProto = firstHeaderValue(headers['x-forwarded-proto']);
  const host = forwardedHost ?? firstHeaderValue(headers.host) ?? 'localhost:4000';
  const protocol = forwardedProto ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return new URL(requestUrl, `${protocol}://${host}`);
}
