import useViewMode from "hooks/useViewMode"
import { PreferredView } from "types/dashboard"
import { viewModeToString } from "@/constants/index"

const RoleSelectModal = ({
  closeModalHandler,
}: {
  closeModalHandler?: () => void
}) => {
  const { setPreferredView } = useViewMode()

  return (
    <div className="flex flex-col gap-6">
      <div
        className="card flex cursor-pointer flex-row! items-center justify-between gap-4"
        onClick={() => {
          setPreferredView(PreferredView.PLAYER)
          closeModalHandler?.()
        }}
      >
        <img
          className=""
          src={`/assets/images/DomainOverview/${viewModeToString[
            PreferredView.PLAYER
          ].toLowerCase()}s-icon.svg`}
          alt=""
        />
        <div>{viewModeToString[PreferredView.PLAYER]}</div>
      </div>
    </div>
  )
}

export default RoleSelectModal
