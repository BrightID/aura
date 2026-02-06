import { useSubjectConnectionInfoFromContext } from '@/hooks/useSubjectEvaluation';
import { connectionLevelIcons } from '@/utils/connection';
import moment from 'moment';
import { useMemo } from 'react';

const ConnectionInformation = ({
  fromSubjectId,
  toSubjectId,
}: {
  fromSubjectId: string;
  toSubjectId: string;
}) => {
  const { connectionInfo, loading } = useSubjectConnectionInfoFromContext({
    fromSubjectId,
    toSubjectId,
  });
  const connectionTime = useMemo(() => {
    if (!connectionInfo?.timestamp) return '-';
    return moment(connectionInfo.timestamp).fromNow();
  }, [connectionInfo?.timestamp]);
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-md bg-soft-bright py-1.5 dark:bg-dark-bright">
      {loading ? (
        '...'
      ) : (
        <>
          <div className="flex items-center gap-1.5">{connectionTime}</div>
          <div className="flex items-center gap-1.5">
            {connectionInfo && (
              <img
                src={`/assets/images/Shared/${
                  connectionLevelIcons[connectionInfo.level]
                }.svg`}
                className="h-[18px] w-[18px]"
                alt=""
              />
            )}
            <p className="text-sm font-bold">{connectionInfo?.level}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectionInformation;
