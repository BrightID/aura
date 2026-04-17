import { useSettingsStore } from '@/store/settings.store';
import { Outlet } from 'react-router';

export default function LandingLayout() {
  const preferredTheme = useSettingsStore((s) => s.prefferedTheme);

  return (
    <div
      className={`${preferredTheme === 'dark' ? 'app_container__dark' : 'app_container'}`}
    >
      <div className="app">
        <Outlet />
      </div>
    </div>
  );
}
