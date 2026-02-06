import { recoveryApi } from '@/api/index';
import localforage from 'localforage';
import { decryptData } from '@/utils/crypto';

export const setProfilePhotoInCache = async (
  brightId: string,
  photo: string,
) => {
  await localforage.setItem(`profile_photo_${brightId}`, photo);
};

export const getProfilePhotoFromCache = async (
  brightId: string,
): Promise<string | null> => {
  return await localforage.getItem(`profile_photo_${brightId}`);
};

export const clearAllProfilePhotoCache = async () => {
  // Get all keys
  const keys = await localforage.keys();
  const profilePhotoKeys = keys.filter((key) =>
    key.startsWith('profile_photo_'),
  );
  for (const key of profilePhotoKeys) {
    await localforage.removeItem(key);
  }
};

/** @deprecated use redux query toolkit backup profile fetch */
export async function pullProfilePhoto(
  key: string,
  brightId: string,
  password: string,
) {
  let profilePhoto: string | null = await getProfilePhotoFromCache(brightId);

  if (profilePhoto) {
    return profilePhoto;
  }
  try {
    const encryptedUserPicture = await recoveryApi.get(
      `/backups/${key}/${brightId}`,
    );

    profilePhoto = decryptData(encryptedUserPicture.data, password);

    await setProfilePhotoInCache(brightId, profilePhoto);

    return profilePhoto;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
