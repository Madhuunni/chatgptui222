import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatStore } from '../core/chat.store';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-sidebar', imports: [FormsModule, IconComponent], templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly store = inject(ChatStore);
  readonly close = output<void>();
  readonly navigate = output<void>();
  readonly toggleTheme = output<void>();
  readonly dark = input(false);
  readonly search = signal('');
  readonly searching = signal(false);
  readonly filtered = computed(() => this.store.conversations().filter(c => (c.title + ' ' + c.messages.map(m => m.content).join(' ')).toLowerCase().includes(this.search().toLowerCase())));
  newChat(): void { this.store.newChat(); this.navigate.emit(); }
  select(id: string): void { this.store.select(id); this.navigate.emit(); }
}
