import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Formateur, FormateurInput } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockMaybe, mockOk, mockVoid } from '../utils/mock.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FormateurService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  getAll(): Observable<Formateur[]> {
    return this.useMock ? mockOk(mockStore.getFormateurs()) : this.api.get<Formateur[]>('formateurs');
  }

  getById(id: string): Observable<Formateur> {
    return this.useMock ? mockMaybe(mockStore.getFormateur(id)) : this.api.get<Formateur>(`formateurs/${id}`);
  }

  create(input: FormateurInput): Observable<Formateur> {
    return this.useMock ? mockOk(mockStore.createFormateur(input)) : this.api.post<Formateur>('formateurs', input);
  }

  update(id: string, input: FormateurInput): Observable<Formateur> {
    return this.useMock ? mockMaybe(mockStore.updateFormateur(id, input)) : this.api.put<Formateur>(`formateurs/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.useMock ? mockVoid(mockStore.deleteFormateur(id)) : this.api.delete<void>(`formateurs/${id}`);
  }
}
