import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiChatRequest, AiChatResponse, AiSessionRequest, AiSessionResponse } from '../models';
import { mockStore } from '../mock/mock-store';
import { mockMaybe } from '../utils/mock.util';
import { ApiService } from './api.service';

/**
 * Talks to the backend AI endpoints (which proxy Anam.ai + OpenAI).
 * In mock mode it returns local demo responses.
 */
@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly api = inject(ApiService);
  private readonly useMock = environment.useMockData;

  createSession(request: AiSessionRequest): Observable<AiSessionResponse> {
    if (this.useMock) return mockMaybe(mockStore.createAiSession(request), 'Formateur not found');
    return this.api.post<AiSessionResponse>('ai/session', request);
  }

  chat(request: AiChatRequest): Observable<AiChatResponse> {
    if (this.useMock) return mockMaybe(mockStore.aiChat(request), 'Formateur not found');
    return this.api.post<AiChatResponse>('ai/chat', request);
  }
}
