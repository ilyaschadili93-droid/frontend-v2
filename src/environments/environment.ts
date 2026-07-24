/**
 * Production environment (used by `ng build`).
 *
 * apiBaseUrl is relative ("/api") because the .NET backend serves this Angular
 * app from the same origin in the bundled single-service deployment — so it
 * works on any domain with no CORS and no hard-coded host.
 */
export const environment = {
  production: true,
  useMockData: false,
  apiBaseUrl: 'https://formateur-ai-backend-production.up.railway.app/api',
};
