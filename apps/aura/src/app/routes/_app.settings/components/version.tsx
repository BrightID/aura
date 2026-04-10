import { useRegisterSW } from "virtual:pwa-register/react"
import { skipToken } from "@reduxjs/toolkit/query"
import { Loader2 } from "lucide-react"
import { MdUpdate } from "react-icons/md"
import { useGetAppLatestVersionQuery } from "@/store/api/backup"

const isDevelopment = process.env.NODE_ENV === "development"

export default function VersionCard() {
  const { data, isLoading } = useGetAppLatestVersionQuery(
    isDevelopment ? skipToken : undefined,
    {
      pollingInterval: 20000,
    },
  )

  const {
    offlineReady: [, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      r &&
        setInterval(() => {
          console.log("Checking for sw update")
          r.update()
        }, 60000)
    },
    onRegisterError(error) {
      console.log("SW registration error", error)
    },
  })

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  return (
    <a-card className="flex items-center justify-between gap-2 rounded-lg py-3.5 pl-5 pr-2">
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
        <a-button disabled>Update</a-button>
      ) : (
        <div>
          {isLoading ? (
            <a-button disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </a-button>
          ) : (
            <a-button
              onClick={handleUpdate}
              disabled={data === APP_VERSION && !needRefresh}
            >
              {!needRefresh ? (
                "Already latest"
              ) : (
                <>
                  Update Available <small>{data}</small>
                </>
              )}
            </a-button>
          )}
        </div>
      )}
    </a-card>
  )
}
