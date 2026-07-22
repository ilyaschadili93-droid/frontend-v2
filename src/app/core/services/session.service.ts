import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Session, SessionInput } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockMaybe, mockOk, mockVoid } from '../utils/mock.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  getAll(formationId?: string): Observable<Session[]> {
    if (this.useMock) return mockOk(mockStore.getSessions(formationId));
    return this.api.get<Session[]>('sessions', formationId ? { formationId } : undefined);
  }

  getById(id: string): Observable<Session> {
    return this.useMock ? mockMaybe(mockStore.getSession(id)) : this.api.get<Session>(`sessions/${id}`);
  }

  create(input: SessionInput): Observable<Session> {
    return this.useMock ? mockOk(mockStore.createSession(input)) : this.api.post<Session>('sessions', input);
  }

  update(id: string, input: SessionInput): Observable<Session> {
    return this.useMock ? mockMaybe(mockStore.updateSession(id, input)) : this.api.put<Session>(`sessions/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.useMock ? mockVoid(mockStore.deleteSession(id)) : this.api.delete<void>(`sessions/${id}`);
  }

  addUser(id: string, userId: string): Observable<void> {
    if (this.useMock) return mockVoid(mockStore.addUserToSession(id, userId));
    return this.api.postAction<void>(`sessions/${id}/add-user/${userId}`);
  }

  removeUser(id: string, userId: string): Observable<void> {
    if (this.useMock) return mockVoid(mockStore.removeUserFromSession(id, userId));
    return this.api.delete<void>(`sessions/${id}/remove-user/${userId}`);
  }
}
