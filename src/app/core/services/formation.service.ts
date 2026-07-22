import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Formation, FormationInput } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockMaybe, mockOk, mockVoid } from '../utils/mock.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FormationService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  getAll(categorieId?: string): Observable<Formation[]> {
    if (this.useMock) return mockOk(mockStore.getFormations(categorieId));
    return this.api.get<Formation[]>('formations', categorieId ? { categorieId } : undefined);
  }

  getById(id: string): Observable<Formation> {
    return this.useMock ? mockMaybe(mockStore.getFormation(id)) : this.api.get<Formation>(`formations/${id}`);
  }

  create(input: FormationInput): Observable<Formation> {
    return this.useMock ? mockOk(mockStore.createFormation(input)) : this.api.post<Formation>('formations', input);
  }

  update(id: string, input: FormationInput): Observable<Formation> {
    return this.useMock ? mockMaybe(mockStore.updateFormation(id, input)) : this.api.put<Formation>(`formations/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.useMock ? mockVoid(mockStore.deleteFormation(id)) : this.api.delete<void>(`formations/${id}`);
  }

  assignFormateur(id: string, formateurId: string): Observable<void> {
    if (this.useMock) return mockVoid(mockStore.assignFormateur(id, formateurId));
    return this.api.postAction<void>(`formations/${id}/assign-formateur/${formateurId}`);
  }
}
