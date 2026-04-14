import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  selectAuthData,
  selectBrightIdBackup,
} from '../store/profile/selectors';

export const useSubjectName = (
  subjectId: string | null | undefined,
): string => {
  if (!subjectId) return '';

  const authData = useSelector(selectAuthData);
  const brightIdBackup = useSelector(selectBrightIdBackup);

  const profileInfo = useMemo(
    () =>
      subjectId === authData?.brightId
        ? brightIdBackup?.userData
        : brightIdBackup?.connections.find((conn) => conn.id === subjectId),
    [brightIdBackup, subjectId, authData],
  );

  return profileInfo?.name ?? profileInfo?.id ?? subjectId!.slice(0, 7);
};
