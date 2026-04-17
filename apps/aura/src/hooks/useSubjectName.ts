import { useMemo } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { decryptUserData } from '@/utils/crypto';
import { BrightIdBackup } from '@/types';

export const useSubjectName = (
  subjectId: string | null | undefined,
): string => {
  if (!subjectId) return '';

  const authData = useProfileStore((s) => s.authData);
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted);
  const brightIdBackup = brightIdBackupEncrypted && authData?.password
    ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup)
    : null;

  const profileInfo = useMemo(
    () =>
      subjectId === authData?.brightId
        ? brightIdBackup?.userData
        : brightIdBackup?.connections.find((conn) => conn.id === subjectId),
    [brightIdBackup, subjectId, authData],
  );

  return profileInfo?.name ?? profileInfo?.id ?? subjectId!.slice(0, 7);
};
