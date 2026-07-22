import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryInput } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockMaybe, mockOk, mockVoid } from '../utils/mock.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  getAll(): Observable<Category[]> {
    return this.useMock ? mockOk(mockStore.getCategories()) : this.api.get<Category[]>('categories');
  }

  getById(id: string): Observable<Category> {
    return this.useMock ? mockMaybe(mockStore.getCategory(id)) : this.api.get<Category>(`categories/${id}`);
  }

  create(input: CategoryInput): Observable<Category> {
    return this.useMock ? mockOk(mockStore.createCategory(input)) : this.api.post<Category>('categories', input);
  }

  update(id: string, input: CategoryInput): Observable<Category> {
    return this.useMock ? mockMaybe(mockStore.updateCategory(id, input)) : this.api.put<Category>(`categories/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.useMock ? mockVoid(mockStore.deleteCategory(id)) : this.api.delete<void>(`categories/${id}`);
  }
}
