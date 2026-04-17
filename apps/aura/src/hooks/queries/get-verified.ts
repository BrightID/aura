import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { BASE_SALT_FOR_CONTACTS, normalizeContactValue } from '@/constants/contacts';

const salt = BASE_SALT_FOR_CONTACTS;

export const useStoreNewContactMutation = () =>
  useMutation({
    mutationFn: async (value: string) => {
      const hashed = await bcrypt.hash(normalizeContactValue(value), salt);
      await axios.post('https://aura-get-verified.vercel.app/api/create-social', { hash: hashed });
    },
  });
