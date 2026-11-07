// Practice records. Their shapes match the standalone vouch-app
// (BrightID/vouch-app, which this code is ported from), because rooms store them in the same format.

export type PracticeDomain = 'interfold' | 'uniqueness';
export type Role = 'subject' | 'player' | 'trainer' | 'manager';

export interface Answer {
  domain: PracticeDomain;
  subject: string;
  rater: string;
  question: number;
  yes: boolean;
  conf: number;
  time: string;
  role?: Role;
  kind?: string;
  edited?: boolean;
  assumed?: boolean;
}

/** An ask sent to someone, such as an operator asking for an endorsement (`kind: 'endorsement'`). */
export interface Outgoing {
  from: string;
  to: string;
  domain: PracticeDomain;
  kind?: string;
  time: string;
  status?: string;
}

export type RequestStatus =
  | 'waiting'
  | 'Rated in'
  | 'Declined'
  | 'later'
  | 'ignored'
  | 'Sent'
  | 'Answered';

/** An ask to be rated in as a player, trainer or manager. */
export interface PlayerRequest {
  from: string;
  to: string;
  domain: PracticeDomain;
  role?: 'player' | 'trainer' | 'manager';
  time: string;
  status: RequestStatus;
  conf?: number;
  decided?: string;
  admittedByManager?: boolean;
}

export interface NameGrant {
  viewer: string;
  person: string;
}

export interface Invite {
  inviter: string;
  name: string;
  role?: 'operator' | 'player';
  createdAt: number;
  claimedBy?: string;
}

export interface PracticeNode {
  id?: string;
  address: string;
  location: string;
  added: string;
}

export type Levels = Partial<Record<Role, number>>;
