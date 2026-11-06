import { CopyIcon } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import { Link } from 'react-router';
import { FadeIn } from '~/components/animations';
import { copyToClipboard } from '~/utils/clipboard';
import { generateDeeplink } from 'brightid_sdk_v6/dist/appMethods';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@aura/ui/toast';
import { useUser } from '~/store';
import { useQuery } from '@tanstack/react-query';
import { brightIdSponsor } from '~/utils/brightid';
import { generatePrivateKey } from 'viem/accounts';
import { Buffer } from 'buffer';
import { v4 } from 'uuid';
import tweetnacl from 'tweetnacl';

const appId = 'AuraDashboard';

const { sign } = tweetnacl;

export default function LoginWithBrightId() {
  const [universalLink, setUniversalLink] = useState('');
  const [qrCodeSize, setQrCodeSize] = useState(400);
  const [appUserId, setAppUserId] = useState(v4().replace(/-/g, ''));
  const user = useUser();

  const [userSig, setUserSig] = useState('');

  const {} = useQuery({
    queryKey: ['sponsorship', appUserId],
    queryFn: async () => {
      try {
        const { publicKey, secretKey } = sign.keyPair();

        const res = await brightIdSponsor(
          Buffer.from(secretKey).toString('base64'),
          appId,
          Buffer.from(publicKey).toString('base64'),
        );
        console.log(res);
      } catch (error) {
        console.error('Sponsor error:', error);
        toast.error('Failed to sponsor user', {
          description: `${error}`,
        });
      }

      return {};
    },
  });

  const copyQr = () => {
    if (!universalLink) return;
    copyToClipboard(universalLink);
    toast('Open this link with the BrightID app.', {
      description: universalLink,
    });
  };

  const generateBrightIDLink = useCallback(() => {
    const privateKey = generatePrivateKey();

    user.generatePrivateKey(privateKey);

    const deepLink = generateDeeplink(appId, privateKey);
    setUniversalLink(deepLink);
  }, []);

  useEffect(() => {
    if (universalLink.length) return;
    setQrCodeSize(Math.min(window.innerWidth * 0.9 - 40, 270));
    generateBrightIDLink();
  }, [generateBrightIDLink, universalLink]);

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <FadeIn delay={0.1} className="space-y-2">
        <h1
          data-testid="recovery-title"
          className="text-3xl font-bold tracking-tight"
        >
          Login
        </h1>
        <p className="text-sm text-muted-foreground">
          <span className="hidden md:inline">Scan to log in with BrightID</span>
          <span className="md:hidden">Tap to log in with BrightID</span>
        </p>
      </FadeIn>

      {universalLink ? (
        <FadeIn delay={0.2}>
          <Link
            to={universalLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-white p-3"
          >
            <QRCode
              value={universalLink}
              size={qrCodeSize}
              quietZone={12}
              removeQrCodeBehindLogo={true}
              logoPadding={0}
              eyeRadius={6}
              logoImage={`${import.meta.env.BASE_URL}images/login/brightid-qrcode-logo.svg`}
              logoWidth={qrCodeSize * 0.25}
              logoHeight={qrCodeSize * 0.25}
              id="qr-code"
            />
          </Link>
        </FadeIn>
      ) : (
        <div className="a-skeleton size-[270px] max-w-full rounded-xl" />
      )}

      <FadeIn delay={0.25} className="flex w-full items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Or
        </span>
        <span className="h-px flex-1 bg-border" />
      </FadeIn>

      <FadeIn delay={0.3} className="flex w-full flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Open this link on your phone
        </p>
        <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/50 py-1.5 pl-3 pr-1.5">
          <a
            href={universalLink || undefined}
            target="_blank"
            data-testid={universalLink ? 'import-universal-link' : undefined}
            className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground underline"
            rel="noreferrer"
          >
            {universalLink || 'Preparing link…'}
          </a>
          <button
            className="a-button"
            type="button"
            data-variant="ghost"
            data-size="icon"
            aria-label="Copy link"
            disabled={!universalLink}
            onClick={copyQr}
          >
            <CopyIcon className="size-4" />
          </button>
        </div>
      </FadeIn>

      <FadeIn delay={0.35} className="w-full">
        <footer className="flex justify-between text-sm text-muted-foreground">
          <span className="flex gap-1">
            <p>Version</p>
            <p data-testid="app-version">{APP_VERSION}</p>
          </span>
          <span className="flex gap-1">
            <p>Powered by</p>
            <p>BrightID</p>
          </span>
        </footer>
      </FadeIn>
    </div>
  );
}
