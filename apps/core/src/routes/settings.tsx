import LogoutButton from '@/components/settings/logout-button';
import SettingCard from '@/components/settings/setting-card';
import ThemeToggle from '@/components/settings/theme-toggle';
import VersionCard from '@/components/settings/version-card';

/**
 * /settings — ported from the React app, same card order.
 *
 * Not ported: the decorative three.js sphere (would pull three+gsap+glsl into
 * the bundle) and the PWA service-worker update flow in the version card.
 * Contact info / Role Management / Onboarding link to their source paths —
 * those routes are still to be migrated.
 */
export default function SettingsPage() {
  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <a-head class="text-2xl">Settings</a-head>

      <section class="flex w-full flex-col gap-4">
        <SettingCard
          icon="contact"
          label="Your Contact info"
          href="/contact-info"
        />
        <SettingCard
          icon="shield"
          label="Role Management"
          href="/role-management"
        />
        <SettingCard
          icon="book-open"
          label="Aura Guide"
          href="https://brightid.gitbook.io/aura"
          external
        />

        <ThemeToggle />

        <SettingCard
          icon="message-circle"
          label="Discord"
          href="https://discord.gg/y24xeXq7mj"
          external
        />
        <SettingCard
          icon="twitter"
          label="X (Twitter)"
          href="https://x.com/brightidproject"
          external
        />
        <SettingCard
          icon="handshake"
          label="Onboarding"
          href="/onboarding?step=1"
        />

        <VersionCard />
        <LogoutButton />
      </section>
    </div>
  );
}
