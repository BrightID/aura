// The verification widget's preview frame, disconnected and mid-verification,
// for the screenshot check (scripts/visual-check.mjs). No network calls.
import '../src/styles.css';
import '@aura/widgets/preview-frame';
import type { AuraPreviewFrame } from '@aura/widgets/preview-frame';

const base = {
  appName: 'Demo App',
  appDescription: 'A sample integration',
  requiredLevel: 2,
  testMode: true,
};
const frame = (id: string) =>
  document.getElementById(id) as unknown as AuraPreviewFrame;
Object.assign(frame('disconnected'), {
  ...base,
  isConnected: false,
  currentLevel: 0,
});
Object.assign(frame('connected'), {
  ...base,
  isConnected: true,
  currentLevel: 1,
  auraScore: 1200,
  evaluationsReceived: 2,
  evaluationsNeeded: 3,
  score: 40,
  scoreNeeded: 100,
  userName: 'Aura User',
});
await Promise.all(
  ['disconnected', 'connected'].map((id) => frame(id).updateComplete),
);
document.getElementById('result')!.textContent = 'READY';
