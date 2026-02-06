import axios from 'axios';
import { apiSlice } from './slice';
import bcrypt from 'bcryptjs';
import { BASE_SALT_FOR_CONTACTS } from '@/constants/contacts';

const salt = BASE_SALT_FOR_CONTACTS;

export const getVerifiedApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    storeNewContact: build.mutation<null, string>({
      queryFn: async (value) => {
        const hashed = await bcrypt.hash(value, salt);

        return axios.post(
          'https://aura-get-verified.vercel.app/api/create-social',
          {
            hash: hashed,
          },
        );
      },
    }),
  }),
  overrideExisting: true,
});

export const { useStoreNewContactMutation } = getVerifiedApi;
