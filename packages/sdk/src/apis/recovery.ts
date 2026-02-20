import axios from "axios"
import { decryptData, hash } from "utils/crypto"

const $http = axios.create({
  baseURL: "https://recovery.brightid.org",
})

export const fetchProfilePhoto = async ({
  brightId,
  key,
  password,
}: {
  key: string
  brightId: string
  password: string
}) => {
  const response = await $http.get(`/brightid/backups/${key}/${brightId}`)

  return decryptData(response.data, password)
}

export const fetchProfileData = async ({
  brightId,
  password,
}: {
  brightId: string
  password: string
}) => {
  const response = await $http.get(
    `/brightid/backups/${hash(brightId + password)}/data`,
  )

  return decryptData(response.data, password)
}
