import { FC, useEffect, useRef, useState } from 'react';
import { resetAllStores } from '@/store/resetAllStores';
import { queryClient } from '@/lib/queryClient';
import { CopyIcon, DatabaseIcon, HomeIcon, TrashIcon } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import Tooltip from './Shared/Tooltip';
import type { DialogElement } from '@aura/ui';

export default function ErrorBoundryUi({
  isDevelopment,
  errorTitle,
  stack,
}: {
  errorTitle?: string;
  stack?: string;
  isDevelopment?: boolean;
}) {
  const [isCopiedMessage, setCopiedMessage] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background">
      <div
        className={`${!isDevelopment ? 'bg-circle-dots' : 'bg-lines'} relative`}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

        <div className="app relative">
          <div className="page flex flex-col gap-y-4 overflow-x-hidden">
            <div className="mt-20 p-2 leading-loose">
              <h3 className="text-3xl font-semibold">
                Something wrong happened!
              </h3>
              <img
                className="mx-auto my-10 rounded-md"
                src="/assets/images/error.webp"
                width={200}
                height={200}
                alt="code error"
              />
              <div className="flex items-center justify-between">
                <p className="text-xl">It seems that the page is crashed.</p>
                <div className="text-right">
                  <Tooltip content="Copy error message" position="left">
                    <a-button
                      size="sm"
                      onClick={() => {
                        stack && navigator.clipboard.writeText(stack);
                        setCopiedMessage(true);
                        setTimeout(() => setCopiedMessage(false), 3000);
                      }}
                      disabled={isCopiedMessage}
                    >
                      {isCopiedMessage ? 'Copied!' : <CopyIcon />}
                    </a-button>
                  </Tooltip>
                </div>
              </div>

              {isDevelopment || (
                <>
                  <p className="mt-4">
                    Please make us aware of this error by sharing it inside our
                    discord channel:
                  </p>
                  <Link target="_blank" to="https://discord.gg/y24xeXq7mj">
                    <a-card className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg py-3.5 pl-5 pr-5">
                      <FaDiscord size={20} className="w-7 cursor-pointer" />
                      <p className="text-[20px] font-medium">Discord</p>
                    </a-card>
                  </Link>
                </>
              )}
            </div>
            {isDevelopment ? (
              <ErrorDetails stack={stack} title={errorTitle} />
            ) : (
              <></>
            )}
            <ErrorRestoreActions />
          </div>
        </div>
      </div>
    </div>
  );
}

export const ErrorDetails: FC<{ title?: string; stack?: string }> = ({
  stack,
  title,
}) => {
  return (
    <div>
      <pre className="mt-2 overflow-auto text-sm leading-loose text-dark-bright">
        {stack}
      </pre>
    </div>
  );
};

export const ErrorRestoreActions = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const dialogRef = useRef<DialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = (e: Event) =>
      setShowConfirm((e as CustomEvent<{ open: boolean }>).detail.open);
    el.addEventListener('open-change', handler);
    return () => el.removeEventListener('open-change', handler);
  }, []);

  useEffect(() => {
    showConfirm ? dialogRef.current?.show() : dialogRef.current?.hide();
  }, [showConfirm]);

  const onClearCache = () => {
    localStorage.clear();
    queryClient.clear();
    navigate('/home');
  };

  const onClearData = () => {
    resetAllStores();
    navigate('/');
  };

  return (
    <>
      <div className="mt-2">
        <div className="text-xl font-semibold">State Recovery Options</div>
        <div className="mt-4 space-y-6">
          {/* Home Navigation Option */}
          <div className="flex items-start gap-4">
            <span className="text-lg font-medium">1.</span>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <p className="font-medium">Navigate to Home</p>
                <Link to="/home">
                  <a-button className="gap-2">
                    <HomeIcon className="h-4 w-4" />
                    Home
                  </a-button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                This will return you to the homepage. Use this first if you{"'"}
                re experiencing navigation issues or unexpected behavior.
              </p>
            </div>
          </div>

          {/* Clear Cache Option */}
          <div className="flex items-start gap-4">
            <span className="text-lg font-medium">2.</span>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <p className="font-medium">Clear Application Cache</p>
                <a-button
                  onClick={onClearCache}
                  variant="secondary"
                  className="gap-2"
                >
                  <DatabaseIcon className="h-4 w-4" />
                  Clear Cache
                </a-button>
              </div>
              <p className="text-sm text-muted-foreground">
                Removes temporary stored data. This might resolve the issue
                without affecting your local stored data.
              </p>
            </div>
          </div>

          {/* Clear Data Option */}
          <div className="flex items-start gap-4">
            <span className="text-lg font-medium">3.</span>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <p className="font-medium">Clear All Data</p>
                <a-button
                  onClick={() => setShowConfirm(true)}
                  color="destructive"
                  className="gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Clear Data
                </a-button>
              </div>
              <p className="text-sm text-muted-foreground">
                Permanently deletes all stored information and logs you out. Use
                as a last resort.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Data Dialog */}
        <a-dialog ref={dialogRef}>
          <div slot="content">
            <h3 className="text-destructive font-semibold text-lg">
              Confirm Permanent Deletion
            </h3>
            <div className="space-y-2 mt-2 text-muted-foreground text-sm">
              <p>This action will:</p>
              <ul className="list-disc pl-6">
                <li>Delete all account information</li>
                <li>Remove all application settings</li>
                <li>Clear cached data and preferences</li>
              </ul>
              <p className="pt-2 font-medium text-foreground">
                This operation cannot be undone. Continue?
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <a-button
                onClick={() => setShowConfirm(false)}
                variant="secondary"
              >
                Cancel
              </a-button>
              <a-button
                onClick={onClearData}
                color="destructive"
                className="gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Confirm Permanent Deletion
              </a-button>
            </div>
          </div>
        </a-dialog>
      </div>
    </>
  );
};
