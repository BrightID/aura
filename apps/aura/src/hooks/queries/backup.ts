import { useQuery, queryOptions } from '@tanstack/react-query';
import { hash, decryptData, decryptUserData } from '@/utils/crypto';
import { recoveryApi } from '@/api';
import type { BrightIdBackup } from '@/types';

export const encryptedUserDataQueryOptions = (key: string) =>
  queryOptions<string>({
    queryKey: ['encrypted-user-data', key],
    queryFn: async () => {
      const res = await recoveryApi.get<string>(`/backups/${key}/data`);
      return res.data;
    },
    staleTime: 5_000_000,
    enabled: !!key,
  });

export const useGetAppLatestVersionQuery = () =>
  useQuery<string>({
    queryKey: ['app-latest-version'],
    queryFn: () =>
      fetch('/versioning.txt', { cache: 'no-store' }).then((r) => r.text()),
    staleTime: 0,
  });

export const useLazyGetAppLatestVersionQuery = () =>
  useQuery<string>({
    queryKey: ['app-latest-version'],
    queryFn: () =>
      fetch('/versioning.txt', { cache: 'no-store' }).then((r) => r.text()),
    staleTime: 0,
    enabled: false,
  });

export const useGetProfileDataQuery = (brightId: string, password: string) =>
  useQuery<BrightIdBackup>({
    queryKey: ['profile-data', brightId, password],
    queryFn: async () => {
      const key = hash(brightId + password);
      const res = await fetch(`/brightid/backups/${key}/data`);
      const text = await res.text();
      return decryptUserData(text, password) as BrightIdBackup;
    },
    retry: 0,
    staleTime: 5_000_000,
    enabled: !!brightId && !!password,
  });

export const useGetProfilePhotoQuery = (key: string, brightId: string, password: string) =>
  useQuery<string>({
    queryKey: ['profile-photo', key, brightId],
    queryFn: async () => {
      const res = await fetch(`/brightid/backups/${key}/${brightId}`);
      const text = await res.text();
      return decryptData(text, password);
    },
    retry: 0,
    staleTime: 5_000_000,
    enabled: !!key && !!brightId && !!password,
  });

export const useLazyGetProfilePhotoQuery = (key: string, brightId: string, password: string) =>
  useQuery<string>({
    queryKey: ['profile-photo', key, brightId],
    queryFn: async () => {
      const res = await fetch(`/brightid/backups/${key}/${brightId}`);
      const text = await res.text();
      return decryptData(text, password);
    },
    retry: 0,
    staleTime: 5_000_000,
    enabled: false,
  });
