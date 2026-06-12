import SettingCard from "@/components/settings/setting-card"
import { preferencesStore, setTheme } from "@/store/preferences"

export default function ThemeToggle() {
  const isDark = () => preferencesStore.theme === "dark"
  return (
    <SettingCard
      icon={isDark() ? "moon" : "sun"}
      label="Theme"
      testid="toggle-theme-btn"
      onClick={() => setTheme(isDark() ? "light" : "dark")}
    >
      <small class="ml-auto" data-testid={`theme-${preferencesStore.theme}`}>
        {preferencesStore.theme.toUpperCase()}
      </small>
    </SettingCard>
  )
}
