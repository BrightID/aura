import { AuraImpact } from '@/api/auranode.service';
import {
  findNearestColor,
  subjectRatingColorMap,
  userRatingColorMap,
  valueColorMap,
} from '@/constants/chart';
import {
  BrightIdBackup,
  BrightIdBackupConnection,
  ConnectionLevel,
} from 'types';

export const connectionLevelIcons: {
  [key in ConnectionLevel]: string | undefined;
} = {
  reported: 'suspicious-icon',
  suspicious: 'suspicious-icon',
  'just met': 'just-met-icon',
  'already known': 'already-known-icon',
  recovery: 'recovery-icon',
  'aura only': 'aura-only',
};

export const parseBrightIdProfileFromBackup = (
  backup: BrightIdBackup,
  subjectId: string,
) => {
  if (backup.userData.id === subjectId) return backup.userData;

  return backup.connections.find((item) => item.id === subjectId);
};

export const parseBrightIdFromBackupAsObject = (
  connections: Record<string, BrightIdBackupConnection>,
  user: BrightIdBackup['userData'],
  subjectId: string,
) => {
  return (
    (subjectId === user.id ? user : connections[subjectId]) ?? {
      id: subjectId,
      name: shortenBrightIdName(subjectId),
    }
  );
};

export const getBarChartColor = (
  item: Pick<AuraImpact, 'confidence' | 'evaluator' | 'impact'>,
  authBrightId: string | undefined,
  focusedSubjectId: string | undefined,
) => {
  const colorMap =
    authBrightId === item.evaluator
      ? userRatingColorMap
      : item.evaluator === focusedSubjectId
        ? subjectRatingColorMap
        : valueColorMap;

  return {
    color: findNearestColor(
      item.confidence * (item.impact >= 0 ? 1 : -1),
      colorMap,
    ),
    borderRadius: item.impact >= 0 ? [4, 4, 0, 0] : [4, 4, 0, 0],
  };
};

export const shortenBrightIdName = (subjectId: string) => subjectId.slice(0, 7);

export const prepareBrightIdProfileResolver = (
  backup: BrightIdBackup | null,
) => {
  if (!backup)
    return (subjectId: string) => ({
      id: subjectId,
      name: shortenBrightIdName(subjectId),
    });

  const connections = backup.connections.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;

      return prev;
    },
    {} as Record<string, BrightIdBackupConnection>,
  );

  return (subjectId: string) =>
    parseBrightIdFromBackupAsObject(connections, backup.userData, subjectId);
};
