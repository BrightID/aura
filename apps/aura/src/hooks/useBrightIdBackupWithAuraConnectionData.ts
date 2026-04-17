import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type AuraNodeBrightIdConnectionWithBackupData,
  type BrightIdBackup,
  type BrightIdBackupConnection,
  type BrightIdBackupWithAuraConnectionData,
} from 'types';
import { useCacheStore } from '@/store/cache.store';
import { useProfileStore } from '@/store/profile.store';
import { decryptUserData, hash } from '@/utils/crypto';
import { useMyEvaluations } from './useMyEvaluations';

export function useBrightIdBackupConnectionResolver() {
  const authData = useProfileStore((s) => s.authData);
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted);
  const brightIdBackup = brightIdBackupEncrypted && authData?.password
    ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup)
    : null;

  const backupConnectionKeys = useMemo(() => {
    return (
      brightIdBackup?.connections.reduce(
        (acc, conn) => {
          acc[conn.id] = conn;
          return acc;
        },
        {} as Record<string, BrightIdBackupConnection>,
      ) || {}
    );
  }, [brightIdBackup]);

  return {
    resolve: (key: string) => backupConnectionKeys[key],
  };
}

export default function useBrightIdBackupWithAuraConnectionData(): BrightIdBackupWithAuraConnectionData | null {
  const authData = useProfileStore((s) => s.authData);
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted);
  const brightIdBackup = brightIdBackupEncrypted && authData?.password
    ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup)
    : null;
  const cachedBrightIdProfiles = useCacheStore((s) => s.fetchedSubjectsFromProfile);
  const setBulkSubjectsCache = useCacheStore((s) => s.setBulkSubjectsCache);
  const getBrightIdBackup = useProfileStore((s) => s.getBrightIdBackup);
  const { myConnections } = useMyEvaluations();

  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const backupConnectionKeys = useMemo(() => {
    return (
      brightIdBackup?.connections.reduce(
        (acc, conn) => {
          acc[conn.id] = conn;
          return acc;
        },
        {} as Record<string, any>,
      ) || {}
    );
  }, [brightIdBackup]);

  const refreshBrightIdBackup = useCallback(async () => {
    if (!authData) return;

    setLoading(true);
    await getBrightIdBackup(hash(authData.brightId + authData.password));
    setLoading(false);
  }, [authData, getBrightIdBackup]);

  useEffect(() => {
    if (
      loading ||
      hasFetched ||
      !myConnections?.length ||
      !cachedBrightIdProfiles
    )
      return;

    const shouldFetch = myConnections.some(
      (conn) =>
        !cachedBrightIdProfiles[conn.id] &&
        conn.level !== 'aura only' &&
        !backupConnectionKeys[conn.id],
    );

    if (!shouldFetch) return;

    setHasFetched(true);

    refreshBrightIdBackup().then(() => {
      const connectionTimestamps = myConnections.reduce(
        (acc, conn) => {
          acc[conn.id] = Date.now();
          return acc;
        },
        {} as Record<string, number>,
      );

      setBulkSubjectsCache(connectionTimestamps);
    });
  }, [
    loading,
    hasFetched,
    myConnections,
    cachedBrightIdProfiles,
    backupConnectionKeys,
    refreshBrightIdBackup,
    setBulkSubjectsCache,
  ]);

  return useMemo(() => {
    if (!brightIdBackup || !myConnections) return null;

    const connections: AuraNodeBrightIdConnectionWithBackupData[] =
      myConnections.map((conn) => ({
        ...backupConnectionKeys[conn.id],
        ...conn,
      }));

    return { ...brightIdBackup, connections };
  }, [brightIdBackup, myConnections, backupConnectionKeys]);
}
