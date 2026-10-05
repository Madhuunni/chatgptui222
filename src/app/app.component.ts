import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { JsonDetailsComponent } from './shared/json-details.component';
import { ReportLinkComponent } from './shared/report-link.component';
import { FormsModule } from '@angular/forms';
import { ResponseDetails } from './core/chat.models';
import { ChatStore } from './core/chat.store';
import { IconComponent } from './shared/icon.component';
import { SidebarComponent } from './sidebar/sidebar.component';
@Component({ selector: 'app-root', imports: [FormsModule, IconComponent, SidebarComponent, JsonDetailsComponent, ReportLinkComponent], templateUrl: './app.component.html' })
export class AppComponent {
  readonly store = inject(ChatStore);
  readonly sidebarOpen = signal(window.innerWidth > 760);
  readonly dark = signal(this.readTheme());
  readonly copied = signal<string | null>(null);
  readonly notice = signal('');
  readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');
  readonly composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');
  draft = '';
  readonly suggestions = [
    { icon: 'edit', title: 'Write something', text: 'Find the right words', prompt: 'Write a friendly follow-up email.' },
    { icon: 'idea', title: 'Make a plan', text: 'Turn an idea into action', prompt: 'Help me plan a productive day.' },
    { icon: 'code', title: 'Build with code', text: 'Solve your next challenge', prompt: 'How should I structure an Angular project?' },
    { icon: 'book', title: 'Learn something', text: 'Make the complex simple', prompt: 'Help me understand a new topic.' }
  ];
  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.dark() ? 'dark' : 'light';
      try { localStorage.setItem('angular-chat-ui.theme', this.dark() ? 'dark' : 'light'); } catch { /* Optional persistence. */ }
    });
    effect(() => {
      this.store.messages(); this.store.busy();
      requestAnimationFrame(() => { const el = this.messageList()?.nativeElement; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); });
    });
  }
  onNavigate(): void { this.draft = ''; this.resize(); if (window.innerWidth <= 760) this.sidebarOpen.set(false); this.composer()?.nativeElement.focus(); }
  newChat(): void { this.store.newChat(); this.onNavigate(); }
  send(): void {
    if (!this.draft.trim() || this.store.busy()) return;
    const message = this.draft; this.draft = ''; this.resize(); void this.store.send(message);
    this.composer()?.nativeElement.focus();
  }
  usePrompt(prompt: string): void { this.draft = prompt; this.resize(); this.composer()?.nativeElement.focus(); }
  onKey(event: KeyboardEvent): void { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); this.send(); } }
  resize(): void { requestAnimationFrame(() => { const el = this.composer()?.nativeElement; if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 180) + 'px'; } }); }
  formatDetails(details: ResponseDetails): string {
    return Object.entries(details).map(([key, value]) => `${key}: ${value ?? '—'}`).join('\n');
  }
  async copy(id: string, content: string): Promise<void> {
    try { await navigator.clipboard.writeText(content); this.copied.set(id); setTimeout(() => this.copied.update(value => value === id ? null : value), 2000); }
    catch { this.notice.set('Copy is unavailable. Select the response text to copy it manually.'); }
  }
  private readTheme(): boolean { try { return localStorage.getItem('angular-chat-ui.theme') === 'dark'; } catch { return false; } }
}
