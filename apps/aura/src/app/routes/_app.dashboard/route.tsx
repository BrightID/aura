import { Modal } from "components/Shared/Modal"
import { useState } from "react"
import { Link } from "react-router"
import { PreferredView } from "types/dashboard"
import { RoutePath } from "types/router"
import { preferredViewIcon } from "@/constants/index"
import { useProfileStore } from "@/store/profile.store"
import { resetAllStores } from "@/store/resetAllStores"
import { __DEV__ } from "@/utils/env"
import RoleSelectModal from "./components/role-select-modal"

const Dashboard = () => {
  const preferredView = useProfileStore((s) => s.preferredView)
  const [isRoleSelectModalOpen, setIsRoleSelectModalOpen] = useState(false)
  return (
    <div className="page">
      <div className="row mb-4">
        <div className="card">
          <p className="text-sm">Domain</p>
          <p className="mb-2.5 font-bold">BrightID</p>
          <p className="text-sm">Energy Team</p>
          <p className="mb-5 font-bold">Core</p>
          <button type="button" className="btn">
            Change
          </button>
        </div>
        <div className="card">
          <p className="mb-5">Preferred view</p>
          <img
            className="icon mx-auto mb-7 h-10! w-10!"
            src={preferredViewIcon[preferredView]}
            alt=""
          />
          <span className="mt-auto flex w-full items-center justify-between">
            <p className="font-bold">{preferredView}</p>
            <a-button
              size={"icon"}
              onClick={() => setIsRoleSelectModalOpen(true)}
            >
              <img src="/assets/images/Dashboard/refresh-icon.svg" alt="" />
            </a-button>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/domain-overview" className="card">
          <img
            className="icon"
            src="/assets/images/Dashboard/domain-overview-icon.svg"
            alt=""
          />
          <p className="text-right text-[18px] text-gray20">
            Domain <br /> Overview
          </p>
        </Link>
        {preferredView === PreferredView.PLAYER && (
          <Link to={RoutePath.HOME} className="card">
            <img
              className="icon"
              src="/assets/images/Dashboard/subject-evaluation-icon.svg"
              alt=""
            />
            <p className="text-right text-[18px] text-gray20">
              Subjects <br /> Evaluation
            </p>
          </Link>
        )}
        {preferredView === PreferredView.TRAINER && (
          <Link to={RoutePath.HOME} className="card">
            <img
              className="icon"
              src="/assets/images/Dashboard/account-icon.svg"
              alt=""
            />
            <p className="text-right text-[18px] text-gray20">
              Players <br /> Evaluation
            </p>
          </Link>
        )}
        {preferredView === PreferredView.MANAGER_EVALUATING_TRAINER && (
          <Link to={RoutePath.HOME} className="card">
            <img
              className="icon"
              src="/assets/images/Dashboard/trainer-icon.svg"
              alt=""
            />
            <p className="text-right text-[18px] text-gray20">
              Trainers <br /> Evaluation
            </p>
          </Link>
        )}

        {preferredView === PreferredView.MANAGER_EVALUATING_TRAINER && (
          <Link to={RoutePath.HOME} className="card">
            <img
              className="icon"
              src="/assets/images/Dashboard/manager-icon.svg"
              alt=""
            />
            <p className="text-right text-[18px] text-gray20">
              Managers <br /> Evaluation
            </p>
          </Link>
        )}

        <Link to={RoutePath.HOME} className="card">
          <img
            className="icon"
            src="/assets/images/Dashboard/performance-overview.svg"
            alt=""
          />
          <p className="text-right text-[18px] text-gray20">
            Performance Overview
          </p>
        </Link>
        <div className="card">
          <img
            className="icon"
            src="/assets/images/Dashboard/setting-icon.svg"
            alt=""
          />
          <p className="mt-auto text-right text-[18px] text-gray20">
            {" "}
            <br /> Settings
          </p>
        </div>
        {(__DEV__ ||
          process.env.VITE_REACT_APP_IS_CYPRESS === "true" ||
          process.env.REACT_APP_ENABLE_LOGOUT === "true") && (
          <button
            className={"btn"}
            onClick={() => resetAllStores()}
            data-testid="logout-button"
          >
            Logout
          </button>
        )}
      </div>
      <Modal
        title={"Role Selection"}
        isOpen={isRoleSelectModalOpen}
        noButtonPadding={true}
        closeModalHandler={() => setIsRoleSelectModalOpen(false)}
        className="select-button-with-modal__modal"
      >
        <RoleSelectModal
          closeModalHandler={() => setIsRoleSelectModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default Dashboard
