/**
 * Development environment.
 *
 * useMockData: true  -> the app runs entirely on local seed data (no backend needed).
 * useMockData: false -> the app calls the real .NET API at apiBaseUrl.
 *
 * Flip the flag to consume the backend running from ../backend/FormateurAI.
 */
export const environment = {
  // Real API mode: consumes the .NET backend (required for the live Anam avatar).
  // Make sure the backend is running (cd ../backend/FormateurAI && dotnet run).
  // Set useMockData: true to run the UI standalone on local seed data instead.
  production: false,
  useMockData: false,
  apiBaseUrl: 'http://localhost:5048/api',
};
