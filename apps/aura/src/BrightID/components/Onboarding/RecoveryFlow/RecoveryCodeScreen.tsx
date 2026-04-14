import {
  clearImportChannel,
  createSyncChannel,
  pollImportChannel,
  setupSync,
} from '@/BrightID/components/Onboarding/ImportFlow/thunks/channelThunks';
import {
  resetRecoveryData,
  selectRecoveryStep,
  setRecoverStep,
  uploadCompletedByOtherSide,
} from '@/BrightID/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { RecoveryErrorType } from '@/BrightID/components/Onboarding/RecoveryFlow/RecoveryError';
import { createRecoveryChannel } from '@/BrightID/components/Onboarding/RecoveryFlow/thunks/channelThunks';
import {
  setRecoveryKeys,
  setupRecovery,
} from '@/BrightID/components/Onboarding/RecoveryFlow/thunks/recoveryThunks';
import { setUserId, userSelector } from '@/BrightID/reducer/userSlice';
import {
  recover_steps,
  RecoveryCodeScreenAction,
  urlTypesOfActions,
} from '@/BrightID/utils/constants';
import { buildRecoveryChannelQrUrl } from '@/BrightID/utils/recovery';
import { AURA_NODE_URL, AURA_NODE_URL_PROXY } from '@/constants/urls';
import useRedirectAfterLogin from 'hooks/useRedirectAfterLogin';
import { useEffect, useMemo, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'store/hooks';
import { loginThunk } from 'store/profile/actions';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { __DEV__ } from '@/utils/env';
import platform from 'platform';
import { FadeIn } from '../../../../components/animations';
import CustomTrans from '../../../../components/CustomTrans';

/**
 * Recovery Code screen of BrightID/
 *
 * displays a qrcode
 */

const RecoveryCodeScreen = () => {
  const { action: actionParam } = useParams();
  const action: RecoveryCodeScreenAction = useMemo(
    () =>
      actionParam
        ? (actionParam as RecoveryCodeScreenAction)
        : RecoveryCodeScreenAction.ADD_SUPER_USER_APP,
    [actionParam],
  );
  const [qrUrl, setQrUrl] = useState<{ href: string } | null>(null);
  const recoveryData = useSelector((state) => state.recoveryData);
  const { id } = useSelector(userSelector);
  const isScanned = useSelector(
    (state) =>
      uploadCompletedByOtherSide(state) ||
      state.recoveryData.recoveredConnections ||
      state.recoveryData.recoveredGroups ||
      state.recoveryData.recoveredBlindSigs,
  );
  const dispatch = useDispatch();
  const step = useSelector(selectRecoveryStep);

  useEffect(() => {
    let cleanupIntervalFn: CallableFunction;

    const runImportEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel and upload new publicKey to be added as a new signing key by the scanner
      await dispatch(createRecoveryChannel(window.location.origin));
      // start polling channel to get connections/groups/blindsigs info
      cleanupIntervalFn = await dispatch(pollImportChannel());
    };
    const runSyncEffect = async () => {
      // create a new aesKey
      await dispatch(setupSync());
      // create channel and upload lastSyncTime to the channel if it is not primary device
      // or poll lastSyncTime from other side if it is and then upload connections/groups/blindsigs
      // added after lastSyncTime to the channel
      await dispatch(createSyncChannel());
      // start polling channel to get new connections/groups/blindsigs info
      cleanupIntervalFn = await dispatch(pollImportChannel());
    };

    async function runEffect() {
      if (step === recover_steps.NOT_STARTED) {
        dispatch(setRecoverStep(recover_steps.INITIALIZING));
        try {
          if (action === RecoveryCodeScreenAction.ADD_SUPER_USER_APP) {
            console.log(`initializing import process`);
            await runImportEffect();
            dispatch(setRecoverStep(recover_steps.INITIALIZED));
          } else if (action === RecoveryCodeScreenAction.SYNC) {
            console.log(`initializing sync process`);
            await runSyncEffect();
            dispatch(setRecoverStep(recover_steps.INITIALIZED));
          } else {
            dispatch(setRecoverStep(recover_steps.NOT_STARTED));
          }
        } catch (_e) {
          dispatch(setRecoverStep(recover_steps.NOT_STARTED));
        }
      }
    }

    runEffect();

    return () => {
      cleanupIntervalFn?.();
    };
  }, [action, dispatch, id]);

  useEffect(() => {
    if (recoveryData.channel.url && recoveryData.aesKey) {
      const channelUrl = recoveryData.channel.url;
      const browser = platform.name;
      const os = platform.os?.family;
      const now = new Date();
      const monthYear = now.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const deviceInfo = `${browser} ${os} ${monthYear}`;

      const newQrUrl = buildRecoveryChannelQrUrl({
        aesKey: recoveryData.aesKey,
        url: channelUrl.href.startsWith('/')
          ? {
              href: channelUrl.href.replace(AURA_NODE_URL_PROXY, AURA_NODE_URL),
            }
          : channelUrl,
        t: urlTypesOfActions[action],
        changePrimaryDevice: false,
        name: `Aura ${deviceInfo}`,
      });

      setQrUrl(newQrUrl);
    }
  }, [action, recoveryData.aesKey, recoveryData.channel.url]);

  // track errors
  useEffect(() => {
    if (recoveryData.errorType !== RecoveryErrorType.NONE) {
      // something went wrong. Show error message to user and stop recovery process
      let message;
      switch (recoveryData.errorType) {
        case RecoveryErrorType.MISMATCH_ID:
          message = 'Your recovery connections selected different accounts';
          break;
        case RecoveryErrorType.GENERIC:
        default:
          // use untranslated errorMessage from state if available, generic message otherwise
          message =
            recoveryData.errorMessage !== ''
              ? recoveryData.errorMessage
              : 'An unknown error occured';
      }
      alert('Account recovery failed: ' + message);
      if (action === RecoveryCodeScreenAction.ADD_SUPER_USER_APP) {
        clearImportChannel();
      }
      dispatch(resetRecoveryData());
      dispatch(setRecoverStep(recover_steps.ERROR));
    }
  }, [action, dispatch, recoveryData.errorMessage, recoveryData.errorType]);

  const user = useSelector((state) => state.user);
  const [importedUserData, setImportedUserData] = useState(false);
  const redirectAfterLogin = useRedirectAfterLogin();
  useEffect(() => {
    if (action === RecoveryCodeScreenAction.ADD_SUPER_USER_APP) {
      if (recoveryData.id && user.password) {
        setImportedUserData(true);
        clearImportChannel();
        dispatch(setRecoveryKeys());
        dispatch(resetRecoveryData());
        dispatch(setUserId(recoveryData.id));
        dispatch(
          loginThunk({ brightId: recoveryData.id, password: user.password }),
        ).then(redirectAfterLogin);
      }
    } else if (action === RecoveryCodeScreenAction.SYNC && isScanned) {
      console.log('TODO: sync');
    }
  }, [action, dispatch, isScanned, recoveryData.id, redirectAfterLogin, user]);
  const universalLink = useMemo(
    () =>
      qrUrl
        ? `https://app.brightid.org/connection-code/${encodeURIComponent(
            qrUrl.href,
          )}`
        : undefined,
    [qrUrl],
  );

  const copyQr = () => {
    if (!universalLink) return;

    let alertText = '';
    let clipboardMsg = '';
    switch (action) {
      case RecoveryCodeScreenAction.ADD_SUPER_USER_APP:
        alertText = 'Open this link with the BrightID app.';
        clipboardMsg = universalLink;
        break;
      case RecoveryCodeScreenAction.SYNC:
        alertText =
          'Open this link with the BrightID app that should be synced.';
        clipboardMsg = universalLink;
        break;
      default:
        break;
    }
    copyToClipboard(universalLink);

    if (__DEV__) {
      clipboardMsg = universalLink;
    }

    alert(alertText + '\n' + clipboardMsg);
  };

  const qrCodeSize = Math.min(window.innerWidth * 0.9 - 40, 270);

  return (
    <div className="page flex min-h-screen flex-col !px-[22px] !pt-[90px] pb-4">
      {importedUserData ? (
        <section
          data-testid="login-download-state"
          className="content mb-6 pl-5 pr-12"
        >
          <p className="mb-6 text-5xl font-black">Login</p>
          <p className="text-lg font-medium">Downloading backup data...</p>
        </section>
      ) : (
        <>
          <section className="content mb-6 pl-5 pr-12">
            <FadeIn delay={0.1}>
              <p
                data-testid="recovery-title"
                className="mb-6 text-5xl font-black"
              >
                Login
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-lg font-medium">
                <span className="hidden md:block">
                  <CustomTrans i18nKey="login.topDescriptionDesktop" />
                </span>
                <span className="block md:hidden">
                  <CustomTrans i18nKey="login.topDescriptionMobile" />
                </span>
              </p>
            </FadeIn>
          </section>

          <a
            className="mb-3 flex flex-col items-center gap-6 pl-8 pr-10"
            href={universalLink}
            target="_blank"
            rel="noreferrer"
            data-testid={universalLink && 'import-universal-qr-code'}
          >
            {universalLink && (
              <FadeIn delay={0.2}>
                <QRCode
                  value={universalLink}
                  size={qrCodeSize}
                  quietZone={12}
                  removeQrCodeBehindLogo={true}
                  logoPadding={0}
                  eyeRadius={6}
                  logoImage={'/assets/images/Shared/brightid-qrcode-logo.svg'}
                  logoWidth={qrCodeSize * 0.25}
                  logoHeight={qrCodeSize * 0.25}
                  id="qr-code"
                />
              </FadeIn>
            )}

            <FadeIn delay={0.25} className="flex items-center gap-2">
              <hr className="h-[1px] w-12" />
              <p className="">Or</p>
              <hr className="h-[1px] w-12" />
            </FadeIn>
            <FadeIn delay={0.25}>
              <p className="text-lg font-medium">
                Open the Link below on your phone
              </p>
            </FadeIn>
          </a>

          <FadeIn delay={0.3} className="actions mb-auto pb-16 text-center">
            <section className="actions mb-auto pb-16 text-center">
              <span className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray00 py-2 pl-3 pr-2.5">
                <a
                  href={universalLink}
                  target="_blank"
                  data-testid={universalLink && 'import-universal-link'}
                  className="line-clamp-1 text-ellipsis text-left font-medium text-white underline"
                  rel="noreferrer"
                >
                  {universalLink}
                </a>
                <img
                  src="/assets/images/login/copy.svg"
                  alt=""
                  onClick={copyQr}
                />
              </span>
            </section>
          </FadeIn>
          <FadeIn delay={0.35}>
            <footer className="flex justify-between text-sm text-gray90">
              <span className="flex gap-1">
                <p className="font-light">Version</p>
                <p data-testid="app-version" className="">
                  {APP_VERSION}
                </p>
              </span>
              <span className="flex gap-1">
                <p className="text-gray50">Powered by:</p>
                <p className="font-light">BrightID</p>
              </span>
            </footer>
          </FadeIn>
        </>
      )}
    </div>
  );
};

export default RecoveryCodeScreen;
