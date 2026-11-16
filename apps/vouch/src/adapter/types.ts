import type { PendingOp } from './pending-op';
import type { Invite, PracticeNode, Role } from '@/model/types';

// The interface the Interfold screens read and write through. Only the
// practice mock (mock.ts) implements it so far. A second implementation, backed
// by the Aura node, is planned for when answers are sent to the node.

export interface Evaluation {
  domain: string;
  category: string;
  /** The question name, such as 'Keyholder', for Interfold answers. */
  question?: string;
  positive: boolean;
  confidence: number;
  modified: string;
  edited?: boolean;
  assumed?: boolean;
}

export interface Connection {
  id: string;
  timestamp: string;
  evaluations: Evaluation[];
}

export interface Vote {
  /** The rater. */
  r: string;
  yes: boolean;
  /** Confidence, 1–4. */
  c: number;
  /** When the answer was given. */
  t: string;
}

export interface Category {
  level: number;
  score: number;
  impacts: Vote[];
}

export interface Verifications {
  block: number;
  categories: Record<string, Category>;
}

export interface EvaluateArgs {
  evaluated: string;
  positive: boolean;
  /** 1–4. */
  confidence: number;
  /** The question index, for the `subject` category. */
  question?: number;
  category: Role;
}

export interface RequestRow {
  from: string;
  to: string;
  domain: string;
  time: string;
  kind?: string;
  role?: string;
  status?: string;
  category?: string;
  decided?: string;
}

export type InviteRow = Invite & { category: 'invite' };

export interface Disclosure {
  nodes: PracticeNode[];
  controlRelationships: string[];
}

export interface Adapter {
  session(): { id: string; name: string } | null;
  getVerifications(id: string): Verifications;
  getConnections(id: string, direction: 'inbound' | 'outbound'): Connection[];
  evaluate(args: EvaluateArgs): PendingOp;
  connect(args: { to: string }): PendingOp;
  linkAddress(args: { address: string }): PendingOp;
  unlinkAddress(): PendingOp;
  disclosure: {
    get(id: string): Disclosure;
    setRelationships(id: string, relationships: string[]): void;
  };
  requests: {
    ask(args: { to: string; category: string }): PendingOp;
    list(): (RequestRow | InviteRow)[];
    defer(args: { from: string; to: string; kind: 'later' | 'ignored' }): void;
    restore(args: { from: string; to: string }): void;
    roleProgress(
      id: string,
      role: Role,
    ): { requests: RequestRow[]; yes: number; required: number };
  };
}
