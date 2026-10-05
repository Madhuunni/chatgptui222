import { Component, input } from '@angular/core';
import { ReportDownload } from '../core/chat.models';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-report-link',
  imports: [IconComponent],
  template: `
    <a class="report-download" [href]="report().url" [attr.download]="report().fileName"
       [class.pdf-download]="report().format === 'pdf'"
       [attr.aria-label]="'Download ' + report().fileName">
      <app-icon [name]="report().format === 'pdf' ? 'pdf' : 'excel'" />
      <span>Click here to download the report
        <small>{{ report().fileName }} · {{ report().format === 'pdf' ? 'PDF document' : 'Excel workbook' }}</small>
      </span>
    </a>`
})
export class ReportLinkComponent {
  readonly report = input.required<ReportDownload>();
}
