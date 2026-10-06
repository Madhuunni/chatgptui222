import { ReportDownload } from './chat.models';

export async function requestReport(report: ReportDownload, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<Blob> {
  const method = report.method ?? 'GET';
  const response = await fetcher(report.url, {
    method,
    signal,
    headers: {
      Accept: report.format === 'pdf' ? 'application/pdf' : 'application/octet-stream, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
    },
    ...(method === 'POST' ? { body: JSON.stringify(report.body) } : {})
  });
  if (!response.ok) throw new Error(`Report download failed (HTTP ${response.status}). Please try again.`);
  const blob = await response.blob();
  if (!blob.size) throw new Error('The server returned an empty report.');
  const contentType = blob.type.toLowerCase().split(';')[0].trim();
  if (contentType.includes('json') || contentType === 'text/html') throw new Error('The server returned a message instead of a report file.');
  if (report.format === 'pdf' && contentType !== 'application/pdf' && contentType !== 'application/octet-stream') {
    throw new Error('The server must return a PDF file with Content-Type application/pdf.');
  }
  return blob;
}

export function saveReport(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  try { anchor.click(); }
  finally {
    anchor.remove();
    // Allow the browser time to begin reading the blob before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
