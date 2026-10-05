const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseChatReply, restoreMessage } = require('../.test-build/chat.models.js');
const { requestChatReply } = require('../.test-build/chat-api.js');
const report = { url: '/api/reports/1/download', fileName: 'report.pdf', format: 'pdf' };
const details = { 'SR #': '00123', 'Balance Due': '3381.64', zero: 0, flag: false, missing: null };
const replies = [
  { type: 'text', content: 'Hello' },
  { type: 'download', content: 'Report generated.', report },
  { type: 'json', content: 'Details', details },
  { type: 'json_download', content: 'Details and report', details, report }
];
for (const reply of replies) test(`POST and validate ${reply.type}`, async () => {
  const result = await requestChatReply('/api/chat', 'show 00123', new AbortController().signal, 1000,
    async (url, options) => {
      assert.equal(url, '/api/chat');
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), { message: 'show 00123' });
      assert.equal(options.headers['Content-Type'], 'application/json');
      return new Response(JSON.stringify(reply), { status: 200 });
    });
  assert.deepEqual(result, reply);
});
test('PDF, XLS, XLSX use explicit format, even with extensionless download URLs', () => {
  for (const format of ['pdf','xls','xlsx']) assert.equal(parseChatReply({type:'download',content:'',report:{...report,format}}).report.format,format);
});
test('unknown types, missing fields, nested details and unsafe URLs are rejected', () => {
  for (const value of [null,{}, {type:'other',content:''}, {type:'json',content:''},
    {type:'json',content:'',details:{nested:{a:1}}}, {type:'download',content:''},
    {type:'download',content:'',report:{...report,url:'javascript:alert(1)'}},
    {type:'download',content:'',report:{...report,format:'exe'}}]) assert.throws(()=>parseChatReply(value));
});
test('plain text does not render stray download or details properties', () => {
  assert.deepEqual(parseChatReply({type:'text',content:'Hi',report,details}),{type:'text',content:'Hi'});
});
test('legacy history is migrated and typed history round trips', () => {
  for (const reply of replies) {
    const saved={...reply,id:'1',role:'assistant'};
    assert.deepEqual(restoreMessage(JSON.parse(JSON.stringify(saved))),saved);
    const legacy={...saved};delete legacy.type;
    if (legacy.report) { legacy.report={...legacy.report};delete legacy.report.format; }
    assert.deepEqual(restoreMessage(legacy),saved);
  }
  assert.equal(restoreMessage({id:'1',role:'assistant',content:'',type:'unknown'}),null);
});
test('HTTP failures and malformed successful responses produce useful errors', async () => {
  const signal=new AbortController().signal;
  await assert.rejects(requestChatReply('/api/chat','x',signal,1000,async()=>new Response('',{status:500})),/HTTP 500/);
  await assert.rejects(requestChatReply('/api/chat','x',signal,1000,async()=>new Response('not json')),/invalid JSON/);
  await assert.rejects(requestChatReply('/api/chat','x',signal,1000,async()=>new Response('{}')),/unsupported or incomplete/);
  await assert.rejects(requestChatReply('/api/chat','x',signal,1000,async()=>{throw new TypeError('Failed to fetch')}),/Cannot reach/);
});
const stalledFetch=async (_url,{signal})=>new Promise((resolve,reject)=>{
  if(signal.aborted) reject(new DOMException('Aborted','AbortError'));
  else signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
});
test('Stop aborts the actual request', async()=>{
  const controller=new AbortController();
  const pending=requestChatReply('/api/chat','x',controller.signal,1000,stalledFetch);
  controller.abort();
  await assert.rejects(pending,{name:'AbortError'});
});
test('already aborted requests and timeouts terminate',async()=>{
  const controller=new AbortController();controller.abort();
  await assert.rejects(requestChatReply('/api/chat','x',controller.signal,1000,stalledFetch),{name:'AbortError'});
  await assert.rejects(requestChatReply('/api/chat','x',new AbortController().signal,5,stalledFetch),/timed out/);
});
