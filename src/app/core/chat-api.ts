import { ChatReply, parseChatReply } from './chat.models';

export async function requestChatReply(endpoint: string, message: string, signal: AbortSignal,
  timeoutMs = 60000, fetcher: typeof fetch = fetch): Promise<ChatReply> {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal.aborted) abort();
  else signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetcher(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message }), signal: controller.signal
    });
    if (!response.ok) throw new Error(`Chat request failed (HTTP ${response.status}). Please try again.`);
    let data: unknown;
    try { data = await response.json(); }
    catch { throw new Error('The server returned invalid JSON.'); }
    try { return parseChatReply(data); }
    catch { throw new Error('The server returned an unsupported or incomplete chat response.'); }
  } catch (error) {
    if (signal.aborted) throw new DOMException('Stopped', 'AbortError');
    if (timedOut) throw new Error('The request timed out. Please try again.');
    if (error instanceof TypeError) throw new Error('Cannot reach the chat server. Please check your connection and API configuration.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}
