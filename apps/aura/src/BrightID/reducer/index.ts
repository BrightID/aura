import recoveryData from '@/BrightID/components/Onboarding/RecoveryFlow/recoveryDataSlice';

import { apiSlice } from '@/store/api/slice';

import keypair from './keypairSlice';
import operations from './operationsSlice';
import settings from './settingsSlice';
import user from './userSlice';
import { backupApiSlice } from '@/store/api/backup';

const reducers = {
  recoveryData,
  settings,
  operations,
  keypair,
  user,
  [backupApiSlice.reducerPath]: backupApiSlice.reducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
};
export default reducers;
