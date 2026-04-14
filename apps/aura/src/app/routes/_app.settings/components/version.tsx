import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGetAppLatestVersionQuery } from '@/store/api/backup';
import { skipToken } from '@reduxjs/toolkit/query';
import { Loader2 } from 'lucide-react';
import { MdUpdate } from 'react-icons/md';
import { useRegisterSW } from 'virtual:pwa-register/react';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function VersionCard() {
  const { data, isLoading } = useGetAppLatestVersionQuery(
    isDevelopment ? skipToken : undefined,
    {
      pollingInterval: 20000,
    },
  );

  const {
    offlineReady: [, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      r &&
        setInterval(() => {
          console.log('Checking for sw update');
          r.update();
        }, 60000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  return (
    <Card className="flex items-center justify-between gap-2 rounded-lg py-3.5 pl-5 pr-2">
      <div>
        <div className="flex items-center gap-2">
          <MdUpdate size={20} />
          <p className="text-[20px] font-medium">Update Aura</p>
        </div>
        <p className="mt-3 text-sm">
          You are currently using version {APP_VERSION}
        </p>
      </div>
      {isDevelopment ? (
        <Button disabled>Update</Button>
      ) : (
        <div>
          {isLoading ? (
            <Button disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={handleUpdate}
              disabled={data === APP_VERSION && !needRefresh}
            >
              {!needRefresh ? (
                'Already latest'
              ) : (
                <>
                  Update Available <small>{data}</small>
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
