import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, UserInput } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockMaybe, mockOk, mockVoid } from '../utils/mock.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  getAll(): Observable<AppUser[]> {
    return this.useMock ? mockOk(mockStore.getUsers()) : this.api.get<AppUser[]>('users');
  }

  getById(id: string): Observable<AppUser> {
    return this.useMock ? mockMaybe(mockStore.getUser(id)) : this.api.get<AppUser>(`users/${id}`);
  }

  create(input: UserInput): Observable<AppUser> {
    return this.useMock ? mockOk(mockStore.createUser(input)) : this.api.post<AppUser>('users', input);
  }

  update(id: string, input: UserInput): Observable<AppUser> {
    return this.useMock ? mockMaybe(mockStore.updateUser(id, input)) : this.api.put<AppUser>(`users/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.useMock ? mockVoid(mockStore.deleteUser(id)) : this.api.delete<void>(`users/${id}`);
  }
}
