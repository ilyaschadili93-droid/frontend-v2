import {
  ChangeDetectionStrategy, Component, DestroyRef,
  computed, inject, input, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { AnamClient } from '@anam-ai/js-sdk';
import { AiChatResponse, AiSessionResponse, FormateurSummary } from '../../../core/models';
import { AiService } from '../../../core/services/ai.service';
import { AuthService } from '../../../core/services/auth.service';
import { AvatarComponent } from '../avatar/avatar';
import { scaleIn } from '../../animations/animations';

interface ChatLine { from: 'user' | 'ai'; text: string; }

/**
 * Embeds the AI trainer as a live, interactive Anam.ai avatar.
 *
 * On "Start", the backend mints a short-lived Anam session token; the Anam JS SDK
 * then streams the avatar into a <video> element. The learner can **speak** (mic is
 * enabled automatically) or **type** — the persona replies out loud and the live
 * transcript is shown. When no valid Anam key is configured, the backend returns a
 * mock token and the panel falls back to a demo video + OpenAI-style text Q&A.
 */
@Component({
  selector: 'app-ai-trainer-panel',
  imports: [FormsModule, MatButtonModule, MatProgressSpinnerModule, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scaleIn],
  templateUrl: './ai-trainer-panel.html',
  styleUrl: './ai-trainer-panel.scss',
})
export class AiTrainerPanelComponent {
  private readonly ai = inject(AiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly trainer = input.required<FormateurSummary>();
  readonly formationId = input<string | null>(null);
  readonly isAuthenticated = this.auth.isAuthenticated;

  private anam: AnamClient | null = null;

  readonly session = signal<AiSessionResponse | null>(null);
  readonly loading = signal(false);      // requesting a token
  readonly connecting = signal(false);   // establishing the Anam stream
  readonly live = signal(false);         // real avatar is streaming
  readonly micMuted = signal(false);
  readonly thinking = signal(false);     // mock chat awaiting reply
  readonly videoError = signal(false);   // demo mp4 failed to load
  readonly errorMsg = signal<string | null>(null);
  readonly lines = signal<ChatLine[]>([]);
  draft = '';
  readonly bars = [0, 1, 2, 3, 4, 5, 6];

  readonly videoId = computed(() => 'anam-video-' + this.trainer().id);
  readonly isReal = computed(() => {
    const s = this.session();
    return !!s && !s.mocked;
  });
  /** Show the live badge/waveform: real stream playing, or a mock demo session running. */
  readonly showLiveUi = computed(() => this.live() || (!!this.session() && !this.isReal()));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardown());
  }

  /** Send the visitor to login (returning here afterwards). */
  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  start(): void {
    if (!this.isAuthenticated()) {
      this.goToLogin();
      return;
    }
    if (this.loading() || this.connecting() || this.session()) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    this.ai.createSession({ formateurId: this.trainer().id, formationId: this.formationId() }).subscribe({
      next: (s) => {
        this.session.set(s);
        this.loading.set(false);
        if (!s.mocked && s.sessionToken) {
          void this.startAnam(s.sessionToken);
        } else {
          // Mock/demo fallback: looping avatar video + OpenAI-style text Q&A.
          this.lines.set([{ from: 'ai', text: `Hi! I'm ${this.trainer().name}. Ask me anything about this topic and I'll explain it — out loud.` }]);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Could not start the AI session.');
      },
    });
  }

  /** Connect to Anam and stream the live avatar into the video element. */
  private async startAnam(token: string): Promise<void> {
    this.connecting.set(true);
    try {
      const { createClient, AnamEvent } = await import('@anam-ai/js-sdk');
      const client = createClient(token);
      this.anam = client;

      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => this.connecting.set(false));
      client.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
        this.connecting.set(false);
        this.live.set(true);
      });
      client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages) => {
        this.lines.set(messages.map((m) => ({ from: (m.role as string) === 'user' ? 'user' : 'ai', text: m.content })));
      });
      client.addListener(AnamEvent.MIC_PERMISSION_DENIED, () => {
        this.errorMsg.set('Microphone blocked — enable it to talk, or just type your question below.');
      });
      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        this.live.set(false);
      });

      // Wait for the call overlay's <video> element to be in the DOM, then attach.
      for (let i = 0; i < 40 && !document.getElementById(this.videoId()); i++) {
        await new Promise((r) => setTimeout(r, 25));
      }
      await client.streamToVideoElement(this.videoId());
    } catch {
      this.connecting.set(false);
      this.errorMsg.set('Could not connect to the AI avatar. Please try again.');
      this.teardown();
      this.session.set(null);
    }
  }

  ask(): void {
    const message = this.draft.trim();
    if (!message) return;
    this.draft = '';

    // Real avatar: send the message; the transcript updates via MESSAGE_HISTORY_UPDATED.
    if (this.isReal() && this.anam) {
      try {
        this.anam.sendUserMessage(message);
      } catch {
        this.errorMsg.set('Message could not be sent. Try speaking instead.');
      }
      return;
    }

    // Mock: round-trip through the backend AI chat (OpenAI or mock).
    if (this.thinking()) return;
    this.lines.update((l) => [...l, { from: 'user', text: message }]);
    this.thinking.set(true);
    this.ai.chat({ formateurId: this.trainer().id, message, formationId: this.formationId() }).subscribe({
      next: (r: AiChatResponse) => {
        this.lines.update((l) => [...l, { from: 'ai', text: r.reply }]);
        this.thinking.set(false);
      },
      error: () => {
        this.lines.update((l) => [...l, { from: 'ai', text: 'Sorry, I could not answer right now.' }]);
        this.thinking.set(false);
      },
    });
  }

  toggleMic(): void {
    if (!this.anam) return;
    if (this.micMuted()) {
      this.anam.unmuteInputAudio();
      this.micMuted.set(false);
    } else {
      this.anam.muteInputAudio();
      this.micMuted.set(true);
    }
  }

  endSession(): void {
    this.teardown();
    this.session.set(null);
    this.live.set(false);
    this.connecting.set(false);
    this.micMuted.set(false);
    this.lines.set([]);
  }

  private teardown(): void {
    if (this.anam) {
      try {
        void this.anam.stopStreaming();
      } catch {
        /* ignore */
      }
      this.anam = null;
    }
  }
}
