const DEFAULT_BOTNEWS_BASE_URL = 'http://localhost:3001';
const DEFAULT_REPORT_ID = 'market-report-001';

function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function asUrl(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  try {
    const parsed = new URL(value);
    return trimSlash(parsed.toString());
  } catch {
    return fallback;
  }
}

export function botNewsBaseUrl() {
  return asUrl(process.env.BOTNEWS_BASE_URL, DEFAULT_BOTNEWS_BASE_URL);
}

export function defaultReportId() {
  return process.env.BOTNEWS_DEFAULT_REPORT_ID || DEFAULT_REPORT_ID;
}

export function allowedCorsOrigins() {
  const configured = process.env.BOTWALLET_ALLOWED_ORIGINS;
  if (!configured) return null;
  const origins = configured.split(',').map((value) => value.trim()).filter(Boolean);
  return origins.length ? origins : null;
}
