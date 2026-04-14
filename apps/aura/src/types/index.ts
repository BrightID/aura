import { Verifications } from '@/api/auranode.service';
import { JSX } from 'react';

import { AuraFilterId } from '../hooks/useFilters';
import { AuraSortId } from '../hooks/useSorts';
import { EvaluationCategory, EvaluationValue } from './dashboard';

export type AuthData = {
  brightId: string;
  password: string;
};

export type ConnectionLevel =
  | 'reported'
  | 'suspicious'
  | 'just met'
  | 'already known'
  | 'recovery'
  | 'aura only';

export type BrightIdConnection = {
  id: string;
  level: ConnectionLevel;
  reportReason: string | null;
  timestamp: number;
};

export type AuraEvaluation = {
  evaluation: EvaluationValue;
  confidence: number;
  domain: 'BrightID';
  category: EvaluationCategory;
  modified: number;
  timestamp: number;
};

export type AuraNodeBrightIdConnection = BrightIdConnection & {
  auraEvaluations?: AuraEvaluation[];
  verifications: Verifications;
};

export type AuraNodeConnectionsResponse = {
  data: {
    connections: AuraNodeBrightIdConnection[];
  };
};

export type BrightIdBackupConnection = BrightIdConnection &
  Partial<{
    name: string;
    connectionDate: number;
    photo: {
      filename: string;
    };
    status: 'verified';
    notificationToken: string;
    socialMedia: any[];
    verifications: Verifications;
    incomingLevel: ConnectionLevel;
  }>;

export type AuraNodeBrightIdConnectionWithBackupData =
  AuraNodeBrightIdConnection & BrightIdBackupConnection;

export type BrightIdBackup = {
  userData: {
    id: string;
    name: string;
    photo: {
      filename: string;
    };
  };
  connections: BrightIdBackupConnection[];
  groups: any[];
};
export type BrightIdBackupWithAuraConnectionData = Omit<
  BrightIdBackup,
  'connections'
> & {
  connections: AuraNodeBrightIdConnectionWithBackupData[];
};

export type InboundEnergyAllocationItem = {
  fromBrightId: string;
  amount: number;
  scale: number;
};
export type InboundEnergyAllocationList = InboundEnergyAllocationItem[];
export type InboundEnergyAllocationRetrieveResponse = {
  energy: InboundEnergyAllocationList;
};

export type EnergyAllocationItem = {
  toBrightId: string;
  amount: number;
  scale: number;
};
export type EnergyAllocationList = EnergyAllocationItem[];
export type EnergyAllocationRetrieveResponse = {
  energy: EnergyAllocationList;
};
export type EnergyAllocationUpdateResponse = {
  energyAllocation: EnergyAllocationList;
};

export type AuraRating = {
  id?: number;
  toBrightId: string;
  fromBrightId: string;
  rating: string;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
  category: EvaluationCategory;
  isPending: boolean;
  verifications?: Verifications;
};

export type AuraInboundConnectionAndRatingData = {
  fromSubjectId: string;
  name?: string;
  rating?: AuraRating;
  inboundConnection?: AuraNodeBrightIdConnection;
  verifications: Verifications;
};

export type AuraOutboundConnectionAndRatingData = {
  toSubjectId: string;
  name?: string;
  rating?: AuraRating;
  outboundConnection?: AuraNodeBrightIdConnection;
  verifications?: Verifications;
};

export type AuraRatingRetrieveResponse = {
  ratings: AuraRating[];
};

export type PlayerHistorySequenceType = {
  subjectId: string;
  evaluationCategory: EvaluationCategory;
};

export type AuraFilterDropdownOption = {
  value: number;
  label: JSX.Element;
  filterIds: AuraFilterId[] | null;
  sortId: AuraSortId | null;
  ascending?: boolean;
  onClick: () => void;
};

export type CredibilityDetailsProps = {
  subjectId: string;
  evaluationCategory: EvaluationCategory;
};
