import { toggleSearchModal } from '@/BrightID/actions';
import { useDispatch } from '@/store/hooks';
import { selectAuthData } from '@/store/profile/selectors';
import { RoutePath } from '@/types/router';
import { BellIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { FaHome } from 'react-icons/fa';
import { alertsSelector } from '@/store/notifications';

export const HeaderBody: FC<
  PropsWithChildren & { title?: string; beforeTitle?: ReactNode }
> = ({ title, children, beforeTitle }) => {
  const authData = useSelector(selectAuthData);
  const subjectId = authData?.brightId;

  if (!subjectId) return null;

  return (
    <>
      <Link to={'/home?tab=evaluate'} className="mr-2 flex items-center gap-1">
        <FaHome className="h-6 w-6" />
      </Link>
      {beforeTitle}
      <span data-testid="header-title" className="text-xl font-semibold">
        {title ?? 'Home'}
      </span>
      {children}
    </>
  );
};

export default function DefaultHeader({
  title,
  children,
  beforeTitle,
  breadcrumbs,
}: {
  title?: string;
  beforeTitle?: ReactNode;
  breadcrumbs?: ReactNode;
} & PropsWithChildren) {
  const dispatch = useDispatch();
  const notificationsCount = useSelector(alertsSelector).filter(
    (item) => !item.viewed,
  ).length;

  return (
    <div className="flex flex-col gap-2.5 px-1 pt-3 md:px-4 md:pt-9">
      {breadcrumbs}
      <header className="header flex flex-wrap items-end gap-y-2 pb-4">
        <div className="header-left flex flex-wrap items-center">
          <HeaderBody beforeTitle={beforeTitle} title={title}></HeaderBody>
        </div>
        {children}
        <span className="header-right ml-auto flex items-center">
          <button
            data-testid="global-search-btn"
            onClick={() => dispatch(toggleSearchModal())}
            className="header-icon mr-2 dark:text-white"
          >
            <SearchIcon size={20} />
          </button>
          <Link
            data-testid={`notifications-count-${notificationsCount}`}
            className="relative"
            to="/notifications"
          >
            {notificationsCount > 0 && (
              <a-badge className="absolute -right-0 -top-3 grid h-5 min-w-5 place-items-center rounded-full bg-dark-bright px-1 font-mono">
                {notificationsCount}
              </a-badge>
            )}
            <BellIcon className="mr-2 h-6 w-6" />
          </Link>
          <Link to={RoutePath.SETTINGS}>
            <SettingsIcon className="h-6 w-6" />
          </Link>
        </span>
      </header>
    </div>
  );
}
