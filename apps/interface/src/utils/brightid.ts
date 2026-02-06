export enum qrCodeURL_types {
  SYNC = '4', // qrcode url is for syncing devices channel
  ADD_SUPER_USER_APP = '5' // qrcode url is for adding super user app
}

export enum RecoveryCodeScreenAction {
  SYNC = 'sync',
  ADD_SUPER_USER_APP = 'superapp'
}
type QrCodeURL_Type = (typeof qrCodeURL_types)[keyof typeof qrCodeURL_types]

export const urlTypesOfActions = {
  [RecoveryCodeScreenAction.SYNC]: qrCodeURL_types.SYNC,
  [RecoveryCodeScreenAction.ADD_SUPER_USER_APP]: qrCodeURL_types.ADD_SUPER_USER_APP
}

export const buildRecoveryChannelQrUrl = ({
  aesKey,
  url,
  t,
  changePrimaryDevice,
  name
}: {
  aesKey: string
  url: { href: string }
  t: QrCodeURL_Type
  changePrimaryDevice: boolean
  name?: string
}) => {
  const qrUrl = new URL(url.href)
  qrUrl.searchParams.append('aes', aesKey)
  qrUrl.searchParams.append('t', t)
  if (name) {
    qrUrl.searchParams.append('n', name)
  }
  qrUrl.searchParams.append('p', String(changePrimaryDevice))
  return qrUrl
}
