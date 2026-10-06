import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { ReportDownload } from '../core/chat.models';
import { requestReport, saveReport } from '../core/report-download';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-report-link',
  imports: [IconComponent],
  styles: [`
    button.report-download { font-family: inherit; text-align: left; }
    button.report-download:disabled { opacity: .65; cursor: wait; }
    .download-error { margin: 8px 0 0; color: var(--text, #252624); font-size: 13px; }
  `],
  template: `
    <button type="button" class="report-download" (click)="download()"
       [disabled]="downloading()" [attr.aria-busy]="downloading()"
       [class.pdf-download]="report().format === 'pdf'"
       [attr.aria-label]="'Download ' + report().fileName">
      <app-icon [name]="report().format === 'pdf' ? 'pdf' : 'excel'" />
      <span aria-live="polite">{{ downloading() ? 'Downloading report…' : 'Click here to download the report' }}
        <small>{{ report().fileName }} · {{ report().format === 'pdf' ? 'PDF document' : 'Excel workbook' }}</small>
      </span>
    </button>
    @if (error()) { <p class="download-error" role="alert">{{ error() }}</p> }
  `
})
export class ReportLinkComponent {
  readonly report = input.required<ReportDownload>();
  readonly downloading = signal(false);
  readonly error = signal('');
  private controller?: AbortController;
  constructor() {
    inject(DestroyRef).onDestroy(() => this.controller?.abort());
  }
  async download(): Promise<void> {
    if (this.downloading()) return;
    const report = this.report();
    const controller = new AbortController();
    this.controller = controller;
    this.downloading.set(true);
    this.error.set('');
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 120_000);
    try {
      const blob = await requestReport(report, controller.signal);
      if (!controller.signal.aborted) saveReport(blob, report.fileName);
    } catch (error) {
      if (timedOut) this.error.set('Report download timed out. Please try again.');
      else if (!controller.signal.aborted) this.error.set(error instanceof TypeError
        ? 'Unable to download the report. Check the connection and backend CORS settings.'
        : error instanceof Error ? error.message : 'Unable to download the report. Please try again.');
    } finally {
      clearTimeout(timeout);
      this.downloading.set(false);
      if (this.controller === controller) this.controller = undefined;
    }
  }
}
