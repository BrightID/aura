import moment from "moment"
import { useMemo } from "react"
import { useSubjectConnectionInfoFromContext } from "@/hooks/useSubjectEvaluation"
import { connectionLevelIcons } from "@/utils/connection"

const ConnectionInformation = ({
  fromSubjectId,
  toSubjectId,
}: {
  fromSubjectId: string
  toSubjectId: string
}) => {
  const { connectionInfo, loading } = useSubjectConnectionInfoFromContext({
    fromSubjectId,
    toSubjectId,
  })
  const connectionTime = useMemo(() => {
    if (!connectionInfo?.timestamp) return "-"
    return moment(connectionInfo.timestamp).fromNow()
  }, [connectionInfo?.timestamp])
  return (
    <div className="border-border/60 bg-muted/40 text-foreground inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
      {loading ? (
        <span className="text-muted-foreground text-xs">...</span>
      ) : (
        <>
          {connectionInfo && (
            <img
              src={`/assets/images/Shared/${
                connectionLevelIcons[connectionInfo.level]
              }.svg`}
              className="h-4 w-4"
              alt=""
            />
          )}
          <span className="text-xs font-semibold">{connectionInfo?.level}</span>
          <span className="bg-border/70 h-3 w-px" aria-hidden />
          <span className="text-muted-foreground text-xs">
            {connectionTime}
          </span>
        </>
      )}
    </div>
  )
}

export default ConnectionInformation
