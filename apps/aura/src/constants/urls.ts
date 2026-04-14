import { IS_PRODUCTION } from '../utils/env';

export const AURA_NODE_URL_PROXY = `/auranode${IS_PRODUCTION ? '' : '-test'}`;

export const AURA_NODE_URL = IS_PRODUCTION
  ? 'https://aura-node.brightid.org'
  : 'https://aura-test.brightid.org';
