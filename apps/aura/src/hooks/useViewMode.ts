import {
  viewAsToViewMode,
  viewModeSubjectString,
  viewModeToEvaluatorViewMode,
  viewModeToViewAs,
} from '@/constants/index';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useProfileStore } from '@/store/profile.store';
import { EvaluationCategory, PreferredView } from '@/types/dashboard';

export default function useViewMode() {
  const preferredViewMode = useProfileStore((s) => s.preferredView);
  const setPreferredViewInStore = useProfileStore((s) => s.setPreferredView);
  const [query] = useSearchParams();
  const currentViewMode = useMemo(() => {
    const viewAs = query.get('viewas');
    if (
      viewAs &&
      (Object.values(EvaluationCategory) as string[]).includes(viewAs)
    ) {
      return viewAsToViewMode[viewAs as EvaluationCategory];
    }
    return preferredViewMode;
  }, [preferredViewMode, query]);

  const currentEvaluationCategory = useMemo(
    () => viewModeToViewAs[currentViewMode],
    [currentViewMode],
  );
  const currentRoleEvaluatorEvaluationCategory = useMemo(
    () => viewModeToViewAs[viewModeToEvaluatorViewMode[currentViewMode]],
    [currentViewMode],
  );

  const setPreferredView = useCallback(
    (value: PreferredView) => {
      setPreferredViewInStore(value);
    },
    [setPreferredViewInStore],
  );

  const subjectViewModeTitle = useMemo(
    () => viewModeSubjectString[currentViewMode],
    [currentViewMode],
  );

  const location = useLocation();
  const navigate = useNavigate();
  const updateViewAs = (value: EvaluationCategory) => {
    // Create a new URLSearchParams object based on the current query string
    const searchParams = new URLSearchParams(location.search);

    // Set the new or update the existing query parameter
    searchParams.set('viewas', value);

    // Navigate to the same route with the new query string
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  return {
    currentViewMode,
    updateViewAs,
    setPreferredView,
    subjectViewModeTitle,
    currentEvaluationCategory,
    currentRoleEvaluatorEvaluationCategory,
  };
}
