import { useMyEvaluationsContext } from "contexts/MyEvaluationsContext"
import { useCallback, useContext, useEffect, useState } from "react"
import { NodeApiContext } from "@/features/brightid/components/NodeApiGate"
import { operation_states } from "@/features/brightid/utils/constants"
import { Operation, useOperationsStore } from "@/store/operations.store"
import { useProfileStore } from "@/store/profile.store"

export function ConnectionLevel({ subjectId }: { subjectId: string }) {
  const { myConnectionToSubject: connection } = useMyEvaluationsContext({
    subjectId,
  })

  const api = useContext(NodeApiContext)
  const authData = useProfileStore((s) => s.authData)
  const addOperation = useOperationsStore((s) => s.addOperation)

  const [loading, setLoading] = useState(false)

  const [connectionOpHash, setConnectionOpHash] = useState<string>("")
  const connectionOp = useOperationsStore((s) =>
    connectionOpHash
      ? (s[connectionOpHash as keyof typeof s] as Operation | undefined)
      : undefined,
  )

  const setRandomConnectionLevel = useCallback(async () => {
    setLoading(true)
    if (!connection || !api || !authData) return
    const level = connection.level === "just met" ? "already known" : "just met"
    if (!level) return
    try {
      const op = (await api.addConnection(
        authData.brightId,
        connection.id,
        level,
        Date.now(),
      )) as Operation
      op.state = operation_states.UNKNOWN
      addOperation(op)
      setConnectionOpHash(op.hash)
    } catch (e) {
      setLoading(false)
      alert(String(e))
    }
  }, [api, authData, connection, addOperation])

  useEffect(() => {
    async function getData() {
      if (connectionOp?.state === operation_states.APPLIED) {
        window.location.reload()
      }
    }

    getData()
  }, [authData, connectionOp?.state])

  return (
    <div className="card flex flex-col gap-2.5 dark:bg-dark-primary">
      [Only shown in DEV mode]{" "}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {connection?.level ?? "..."}
          <button type="button" onClick={setRandomConnectionLevel}>Change</button>
        </div>
      )}
    </div>
  )
}
