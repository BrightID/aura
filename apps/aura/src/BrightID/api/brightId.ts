import { ApiOkResponse, ApiResponse, ApisauceInstance, create } from 'apisauce';
import BrightidError from '@/BrightID/api/brightidError';
import { operation_states } from '@/BrightID/utils/constants';
import {
  b64ToUint8Array,
  hash,
  strToUint8Array,
  uInt8ArrayToB64,
} from '@/BrightID/utils/encoding';
import stringify from 'fast-json-stable-stringify';
import nacl from 'tweetnacl';

import { EvaluationCategory, EvaluationValue } from '../../types/dashboard';
import {
  ConnectOp,
  EvaluateOp,
  NodeOps,
  SpendSponsorshipOp,
  SubmittedOp,
} from './operation_types';

const v = 6;

export class NodeApi {
  api: ApisauceInstance;

  baseUrlInternal: string;

  secretKey: Uint8Array | string | undefined;

  id: string | undefined;

  constructor({
    url,
    secretKey,
    id,
    monitor,
  }: {
    url: string;
    secretKey: Uint8Array | string | undefined;
    id: string | undefined;
    monitor?: (response: ApiResponse<any>) => void;
  }) {
    this.baseUrlInternal = url;
    this.id = id;
    this.secretKey = secretKey;
    this.api = create({
      baseURL: this.apiUrl,
      headers: { 'Cache-Control': 'no-cache' },
      timeout: 60 * 1000, // one minute timeout for requests
    });
    monitor && this.api.addMonitor((response) => monitor(response));
  }

  get baseUrl() {
    return this.baseUrlInternal;
  }

  set baseUrl(url: string) {
    this.baseUrlInternal = url;
    this.api.setBaseURL(this.apiUrl);
  }

  get apiUrl() {
    return `${this.baseUrl}/brightid/v${v}`;
  }

  static checkHash(response: ApiOkResponse<OperationPostRes>, message: string) {
    if (response.data?.data.hash !== hash(message)) {
      throw new Error('Invalid operation hash returned from server');
    }
    return response.data?.data.hash;
  }

  static throwOnError(response: ApiResponse<NodeApiRes, ErrRes>) {
    if (response.ok) {
      return true;
    } else if (response.data && (response.data as ErrRes).errorNum) {
      throw new BrightidError(response.data as ErrRes);
    } else {
      throw new Error(response.problem);
    }
  }

  async addConnection(
    id1: string,
    id2: string,
    level: string,
    timestamp: number,
    reportReason?: ReportReason,
    requestProof?: string,
    fakeUser?: FakeUser,
  ) {
    console.log({
      id: this.id,
      secretKey: this.secretKey,
    });
    if (this.id === undefined || this.secretKey === undefined) {
      throw new Error('Missing API credentials');
    }
    const sk = fakeUser
      ? b64ToUint8Array(fakeUser.secretKey)
      : new Uint8Array(Object.values(this.secretKey));

    const name = 'Connect';

    const op: ConnectOp = {
      name,
      id1,
      id2,
      level,
      timestamp,
      v,
    };

    if (reportReason) {
      op.reportReason = reportReason;
    }
    if (requestProof) {
      op.requestProof = requestProof;
    }

    const message = stringify(op);
    const signed = nacl.sign.detached(strToUint8Array(message), sk);
    op.sig1 = uInt8ArrayToB64(signed);
    return this.submitOp(op, message);
  }

  async evaluate(
    evaluator: string,
    evaluated: string,
    evaluation: EvaluationValue,
    confidence: number,
    domain: 'BrightID',
    category: EvaluationCategory,
    timestamp: number,
  ) {
    console.log({
      id: this.id,
      secretKey: this.secretKey,
    });
    if (this.id === undefined || this.secretKey === undefined) {
      throw new Error('Missing API credentials');
    }
    const sk = new Uint8Array(Object.values(this.secretKey));

    const op: EvaluateOp = {
      name: 'Evaluate',
      evaluator,
      evaluated,
      evaluation,
      confidence,
      domain,
      category,
      timestamp,
      v,
    };

    const message = stringify(op);
    const signed = nacl.sign.detached(strToUint8Array(message), sk);
    op.sig = uInt8ArrayToB64(signed);
    return await this.submitOp(op, message);
  }

  async submitOp(signedOp: NodeOps, message: string): Promise<SubmittedOp> {
    // post to node and check result
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      signedOp,
    );
    NodeApi.throwOnError(res);

    // posted successfully. Add hash and postTimestamp to op.
    const submittedOp = signedOp as SubmittedOp;
    submittedOp.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    submittedOp.postTimestamp = Date.now();
    return submittedOp;
  }

  async getProfile(id: string) {
    const requester = this.id;
    const url = `/users/${id}/profile/${requester || ''}`;
    const res = await this.api.get<UserProfileRes, ErrRes>(url);
    NodeApi.throwOnError(res);
    return (res.data as UserProfileRes).data;
  }

  async getConnections(id: string, direction: 'inbound' | 'outbound') {
    const res = await this.api.get<UserConnectionsRes, ErrRes>(
      `/users/${id}/connections/${direction}`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserConnectionsRes).data?.connections;
  }

  async getMemberships(id: string) {
    const res = await this.api.get<UserMembershipsRes, ErrRes>(
      `/users/${id}/memberships`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserMembershipsRes).data?.memberships;
  }

  async getInvites(id: string) {
    const res = await this.api.get<UserInvitesRes, ErrRes>(
      `/users/${id}/invites`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserInvitesRes).data?.invites;
  }

  async getOperationState(opHash: string): Promise<OperationInfo> {
    const res = await this.api.get<OperationRes, ErrRes>(
      `/operations/${opHash}`,
    );
    if (res.status === 404) {
      // operation is not existing on server. Don't throw an error, as a client might try to check
      // operations sent by other clients without knowing if they have been submitted already.
      return {
        state: operation_states.UNKNOWN,
        result: '',
      };
    }
    NodeApi.throwOnError(res);
    return (res.data as OperationRes).data;
  }

  async getApps() {
    const res = await this.api.get<AppsRes, ErrRes>(`/apps`);
    NodeApi.throwOnError(res);
    return (res.data as AppsRes).data?.apps;
  }

  async getState() {
    const res = await this.api.get<StateRes, ErrRes>(`/state`);
    NodeApi.throwOnError(res);
    return (res.data as StateRes).data;
  }

  async getPublic(app: string, roundedTimestamp: number, verification: string) {
    console.log(15, app, roundedTimestamp, verification);
    const res = await this.api.get<PublicRes, ErrRes>(
      `/verifications/blinded/public`,
      { app, roundedTimestamp, verification },
    );
    NodeApi.throwOnError(res);
    return (res.data as PublicRes).data.public;
  }

  async getBlindedSig(pub: string, sig: string, e: string) {
    const res = await this.api.get<BlindSigRes, ErrRes>(
      `/verifications/blinded/sig/${this.id}`,
      { public: pub, sig, e },
    );
    NodeApi.throwOnError(res);
    return (res.data as BlindSigRes).data.response;
  }

  async linkAppId(sig: SigInfo, appId: string) {
    console.log(`/verifications/${sig.app}/${appId}`);
    console.log({
      sig: sig.sig,
      uid: sig.uid,
      verification: sig.verification,
      roundedTimestamp: sig.roundedTimestamp,
    });
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/verifications/${sig.app}/${appId}`,
      {
        sig: sig.sig,
        uid: sig.uid,
        verification: sig.verification,
        roundedTimestamp: sig.roundedTimestamp,
      },
    );

    NodeApi.throwOnError(res);
  }

  async spendSponsorship(appId: string, appUserId: string) {
    const name = 'Spend Sponsorship';
    const timestamp = Date.now();
    const op: SpendSponsorshipOp = {
      name,
      app: appId,
      appUserId,
      timestamp,
      v,
    };
    const message = stringify(op);
    return this.submitOp(op, message);
  }

  async getSponsorship(appUserId: string) {
    const res = await this.api.get<SponsorshipRes, ErrRes>(
      `/sponsorships/${appUserId}`,
    );
    NodeApi.throwOnError(res);
    return (res.data as SponsorshipRes).data;
  }
}
