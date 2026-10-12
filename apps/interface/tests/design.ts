// Synthetic design checks; no login or verification submission is performed.
import '../src/styles.css';
import '@aura/ui';
import { html, render, LitElement } from 'lit';
import { queryClient } from '../src/utils/apis';
import { userBrightId } from '../src/states/user';
import { BrightIDLoginElement } from '../src/routes/brightid';
import { createBlockiesImage } from '../src/utils/image';

queryClient.setQueryData(['profile', userBrightId.get()], {
  verifications: [
    {
      name: 'Aura',
      domains: [
        {
          name: 'BrightID',
          categories: [{ name: 'subject', level: 4, score: 150000000 }],
        },
      ],
    },
  ],
});
await Promise.all([
  import('../src/components/ui/layout'),
  import('../src/components/ui/footer'),
  import('../src/components/common/profile-card'),
  import('../src/components/common/verifier-card'),
  import('../src/components/common/verification-card'),
  import('../src/components/common/notification-card'),
]);
class DesignBrightId extends BrightIDLoginElement {
  protected async setupBrightIDSuperAppLogin() {}
  protected render() {
    return html`<div class="container">
      <img
        class="qr-code"
        src=${createBlockiesImage('qr-preview')}
        alt="QR size fixture"
      />
    </div>`;
  }
}
customElements.define('design-brightid', DesignBrightId);
const image = createBlockiesImage('design-check');
render(
  html`<a-theme-provider
    ><app-layout>
      <p id="result" style="text-align:left">Checking…</p>
      <h1 style="text-align:left">Your verification</h1>
      <profile-card
        firstName="Alexandra"
        lastName="Verylongunbrokenfamilyname"
        email="long-address-for-layout@example.com"
        .image=${image}
      ></profile-card>
      <h2 style="text-align:left">Your apps</h2>
      <verification-card
        name="Community verification with a long project name"
        .stepsCompleted=${2}
        .totalSteps=${4}
        .projectId=${1}
      ></verification-card>
      <h2 style="text-align:left">Verifiers</h2>
      <verifier-card
        verifierName="Alexandra Verylongunbrokenfamilyname"
        verifierEmail="long-address-for-layout@example.com"
        .verifierPicture=${image}
        .progressPercent=${Infinity}
      ></verifier-card>
      <h2 style="text-align:left">Notifications</h2>
      <notification-card
        userName="Verylongunbrokenprofileidentifier"
        description="Your latest evaluation is now available. Review your progress and continue verification."
        .profileImage=${image}
        .timestamp=${'Today'}
      ></notification-card>
      <h2 style="text-align:left">BrightID panel</h2>
      <design-brightid></design-brightid>
      <app-footer></app-footer> </app-layout
  ></a-theme-provider>`,
  document.getElementById('fixture')!,
);
async function check() {
  await Promise.all(
    [...document.querySelectorAll('*')]
      .filter((el) => el instanceof LitElement)
      .map((el) => (el as LitElement).updateComplete),
  );
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const failures: string[] = [];
  if (!createBlockiesImage('').startsWith('data:image/'))
    failures.push('Empty avatar seed');
  function inspect(root: Element | ShadowRoot) {
    for (const el of root.children) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.left < -1 || r.right > innerWidth + 1))
        failures.push(`Overflow: ${el.tagName}`);
      if (el.shadowRoot) inspect(el.shadowRoot);
      inspect(el);
    }
  }
  inspect(document.getElementById('fixture')!);
  const profile = document.querySelector('profile-card')!;
  if (!profile.shadowRoot!.textContent?.includes('Max Level'))
    failures.push('Maximum level label');
  if (
    (profile.shadowRoot!.querySelector('.progress') as HTMLElement).style
      .width !== '100%'
  )
    failures.push('Maximum level progress');
  const verifier = document.querySelector('verifier-card')!;
  for (const [value, expected] of [
    [-10, '0%'],
    [NaN, '0%'],
    [Infinity, '100%'],
  ] as const) {
    (
      verifier as import('../src/components/common/verifier-card').VerifierCard
    ).progressPercent = value;
    await (verifier as LitElement).updateComplete;
    if (
      (verifier.shadowRoot!.querySelector('.progress') as HTMLElement).style
        .width !== expected
    )
      failures.push(`Progress clamp: ${value}`);
  }
  if (
    document
      .querySelector('verification-card')!
      .shadowRoot!.querySelector('a-button')
  )
    failures.push('Nested action in card link');
  document.getElementById('result')!.textContent = failures.length
    ? failures.join(', ')
    : 'PASS: bounds, progress and card link';
}
window.addEventListener('resize', check);
await check();
