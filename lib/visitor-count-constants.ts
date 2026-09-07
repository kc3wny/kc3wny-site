// Split from lib/visitor-count.ts so the client-side counter component can
// import this without pulling the server-only `redis` package into the
// browser bundle.
export const FALLBACK_COUNT = 0;
