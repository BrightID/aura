import { AuraImpact, Verifications } from '@/api/auranode.service';
import { EvaluationCategory } from '@/types/dashboard';
import { hash } from '@/utils/crypto';
import {
  AuraNodeBrightIdConnection,
  type BrightIdBackupConnection,
} from 'types';

export const TEST_BRIGHT_ID = 'TEST_BRIGHTID';
export const TEST_BRIGHT_PASSWORD = 'TEST_BRIGHTID_PASSWORD';
export const TEST_AUTH_KEY = hash(TEST_BRIGHT_ID + TEST_BRIGHT_PASSWORD);

export const generateRandomBrightId = () =>
  Math.random().toString(36).slice(2, 16);

export const generateRandomBrightIdConnectionBackup = (
  incomingLevel: ConnectionLevel = 'already known',
  level: ConnectionLevel = 'just met',
) => {
  return {
    id: generateRandomBrightId(),
    name: `Name ${Math.random().toString(36).slice(2, 5)}`,
    connectionDate: Date.now(),
    photo: {
      filename: `${Math.random().toString(36).slice(2, 16)}.jpg`,
    },
    status: 'verified', // static status
    notificationToken: 'TOKEN', // static token
    level,
    socialMedia: [], // empty array for simplicity
    verifications: [
      {
        name: 'Aura',
        block: Math.floor(Math.random() * 100000),
        timestamp: new Date(),
        domains: [
          {
            name: 'BrightID',
            categories: [],
          },
        ],
      },
      {
        name: 'Seed',
        block: Math.floor(Math.random() * 100000),
        timestamp: Date.now(),
      },
    ],
    timestamp: Date.now(),
    incomingLevel,
    reportReason: null,
    auraEvaluations: [],
  } as AuraNodeBrightIdConnection;
};

export const addPlayerRuleWithCategoryToConnection = (
  connection: BrightIdBackupConnection,
  category: EvaluationCategory,
  impacts: AuraImpact[],
  level = 1,
) => {
  connection.verifications![0].domains![0]!.categories.push(
    createSubjectCategory(category, impacts, level),
  );
};

export const createDomainFromBrightIdConenction = (
  connection: BrightIdBackupConnection,
) => {
  connection.verifications?.push({
    block: 123,
    name: 'Aura',
    timestamp: new Date().getTime() / 1000,
    domains: [
      {
        categories: [],
        name: 'BrightID',
      },
    ],
  });
};

export const createSubjectCategory = (
  category: EvaluationCategory,
  impacts: AuraImpact[],
  level = 1,
) => {
  return {
    name: category,
    score: impacts.reduce((prev, curr) => (curr.score ?? 0) + prev, 0),
    level,
    impacts,
  };
};

export const BRIGHTID_BACKUP = {
  userData: {
    id: TEST_BRIGHT_ID,
    name: 'Test User',
    photo: {
      filename: 'test-image.jpg',
    },
  },
  connections: Array.from({ length: 5 }, () =>
    generateRandomBrightIdConnectionBackup(),
  ),
  groups: [],
};

export const generateEvaluationImpact = (
  fromBrightId: string,
  score?: number,
  confidence?: number,
  impact?: number,
) => {
  return {
    evaluatorName: fromBrightId.slice(0, 7),
    evaluator: fromBrightId,
    score: score ?? Math.random() * 200000,
    confidence: confidence ?? Math.round(Math.random() * 4),
    impact: impact ?? Math.abs(Math.random() * 100),
    level: 1,
    modified: Date.now(),
  };
};

export const generateRoleData = (
  name: string,
  level?: number,
  evaluationsCount = 5,
) => {
  const evaluations = Array.from({ length: evaluationsCount }).map(() =>
    generateEvaluationImpact(generateRandomBrightId(), Math.random() * 1000000),
  );

  return {
    name,
    level: level ?? 1,
    impacts: evaluations,
    score: evaluations.reduce((prev, curr) => prev + curr.score, 0),
  };
};

export const findProfileCategory = (profile: any, name: string) => {
  return profile.data.verifications[0].domains[0].categories.find(
    (item: { name: string }) => item.name === name,
  ) as {
    name: string;
    level: number;
    impacts: {
      evaluatorName: string;
      evaluator: string;
      score: number;
      confidence: number;
      impact: number;
      level: number;
    }[];
    score: number;
  };
};

export const generateMockedProfile = (
  brightId = generateRandomBrightId(),
  categories: any[] | null = null,
) => {
  return {
    id: brightId,
    sponsored: true,
    verifications: [
      {
        name: 'Aura',
        block: 30146400,
        timestamp: 1740282045881,
        domains: [
          {
            name: 'BrightID',
            categories: categories ?? [],
          },
        ],
      },
    ],
    recoveryConnections: [],
    connectionsNum: 11,
    groupsNum: 0,
    reports: [],
    createdAt: new Date(),
    signingKeys: [],
    requiredRecoveryNum: 2,
  };
};

export const mockedBrightIdProfileData = {
  data: {
    id: TEST_BRIGHT_ID,
    sponsored: true,
    verifications: [
      {
        name: 'Aura',
        block: 30146400,
        timestamp: 1740282045881,
        domains: [
          {
            name: 'BrightID',
            categories: [
              generateRoleData('subject'),
              generateRoleData('player'),
              generateRoleData('trainer'),
              generateRoleData('manager'),
            ],
          },
        ],
      },
    ] as Verifications,
    recoveryConnections: [],
    connectionsNum: 11,
    groupsNum: 0,
    reports: [],
    createdAt: new Date().getTime(),
    signingKeys: [],
    requiredRecoveryNum: 2,
  },
};

export const findRoleVerification = (verificationName: string) => {
  return mockedBrightIdProfileData.data.verifications[0].domains![0].categories.find(
    (item) => item.name === verificationName,
  );
};

export const mockOutboundData = {
  data: {
    connections: [],
  },
};

export const mockInboundData = {
  data: {
    connections: [],
  },
};
