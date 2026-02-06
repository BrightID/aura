import { selectPreferredTheme } from '@/BrightID/reducer/settingsSlice';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';

export default function LandingLayout() {
  const preferredTheme = useSelector(selectPreferredTheme);

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
