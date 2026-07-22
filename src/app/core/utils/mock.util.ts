import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/** Simulated network latency so skeleton loaders are visible in mock mode. */
const MOCK_DELAY = 300;

/** Emit a value after a short delay, mimicking an HTTP response. */
export function mockOk<T>(value: T): Observable<T> {
  return of(value).pipe(delay(MOCK_DELAY));
}

/** Emit the value, or error like a 404 when it is undefined. */
export function mockMaybe<T>(value: T | undefined, notFoundMsg = 'Resource not found'): Observable<T> {
  return value === undefined ? throwError(() => new Error(notFoundMsg)) : mockOk(value);
}

/** Emit void after a short delay (for action endpoints returning 204). */
export function mockVoid(ok: boolean, notFoundMsg = 'Resource not found'): Observable<void> {
  return ok ? mockOk(void 0) : throwError(() => new Error(notFoundMsg));
}
