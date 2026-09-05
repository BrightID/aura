import { PreferredView } from '@aura/domain/types/dashboard';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import {
  viewAsToViewMode,
  viewModeSubjectString,
  viewModeToEvaluatorViewMode,
  viewModeToViewAs,
  viewSlugToViewMode,
} from '@aura/domain/view-mode';
import { useParams, useSearchParams } from '@solidjs/router';
import { createMemo } from 'solid-js';

export function useViewMode() {
  const routeParams = useParams();
  const [params, setParams] = useSearchParams();

  const currentViewMode = createMemo(() => {
    const slug = routeParams.view;
    if (slug && slug in viewSlugToViewMode) return viewSlugToViewMode[slug];

    const viewAs = routeParams.viewas ?? params.viewas;
    if (
      typeof viewAs === 'string' &&
      (Object.values(EvaluationCategory) as string[]).includes(viewAs)
    ) {
      return viewAsToViewMode[viewAs as EvaluationCategory];
    }
    return PreferredView.PLAYER;
  });

  const currentEvaluationCategory = createMemo(
    () => viewModeToViewAs[currentViewMode()],
  );
  const currentRoleEvaluatorEvaluationCategory = createMemo(
    () => viewModeToViewAs[viewModeToEvaluatorViewMode[currentViewMode()]],
  );
  const subjectViewModeTitle = createMemo(
    () => viewModeSubjectString[currentViewMode()],
  );

  const updateViewAs = (value: EvaluationCategory) =>
    setParams({ viewas: value });

  return {
    currentViewMode,
    currentEvaluationCategory,
    currentRoleEvaluatorEvaluationCategory,
    subjectViewModeTitle,
    updateViewAs,
  };
}
