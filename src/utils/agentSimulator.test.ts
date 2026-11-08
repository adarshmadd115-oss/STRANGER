import test from 'node:test';
import assert from 'node:assert/strict';
import { validateToolCall, planTaskForInput, ALLOWED_TOOLS } from './agentSimulator';

test('ToolAllowList strictly blocks raw shell or arbitrary commands', () => {
  const shellCheck = validateToolCall('bash_exec', { cmd: 'rm -rf /' });
  assert.equal(shellCheck.valid, false);
  assert.match(shellCheck.reason || '', /not in the STRANGER allow-list/);

  const pythonCheck = validateToolCall('python_eval', { code: 'exit()' });
  assert.equal(pythonCheck.valid, false);
});

test('Valid tool calls in allow-list pass correctly', () => {
  const appCheck = validateToolCall('open_app', { package_name: 'com.whatsapp' });
  assert.equal(appCheck.valid, true);
  assert.equal(appCheck.proposal?.toolName, 'open_app');
  assert.equal(appCheck.proposal?.requiresConfirmation, false);
});

test('Download tool requires HTTPS and user confirmation gate', () => {
  const httpCheck = validateToolCall('download_file', { url: 'http://insecure.site/file.apk' });
  assert.equal(httpCheck.valid, false);

  const httpsCheck = validateToolCall('download_file', { url: 'https://site.org/notes.pdf' });
  assert.equal(httpsCheck.valid, true);
  assert.equal(httpsCheck.proposal?.requiresConfirmation, true);
  assert.equal(httpsCheck.proposal?.riskLevel, 'needs_confirmation');
});

test('Plan task parses PDF and WhatsApp requests into multi-step actions', () => {
  const pdfTask = planTaskForInput('Download AKTU syllabus PDF', 'en');
  assert.notEqual(pdfTask, null);
  assert.equal(pdfTask?.requiresConfirmation, true);
  assert.equal(pdfTask?.steps.length, 3);

  const hindiTask = planTaskForInput('WhatsApp पर नोट्स शेयर करो', 'hi');
  assert.notEqual(hindiTask, null);
  assert.equal(hindiTask?.requiresConfirmation, true);
});
