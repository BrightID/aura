import axios from 'axios';
import { AURA_NODE_URL_PROXY } from '@/constants/urls';

export const recoveryApi = axios.create({
  baseURL: '/brightid',
  // @ts-ignore
  mode: 'no-cors',
});

export const auraBrightIdNodeApi = axios.create({
  baseURL: AURA_NODE_URL_PROXY,
  // @ts-ignore
  mode: 'no-cors',
});
