import { resetStore } from '@/BrightID/actions';
import { MoveUpIn } from '@/components/animations';
import Modal from '@/components/Shared/Modal';
import { preferredViewIcon } from '@/constants';
import RoleSelectModal from '@/app/routes/_app.dashboard/components/RoleSelectModal';
import { selectPreferredView } from '@/store/profile/selectors';
import { PreferredView } from '@/types/dashboard';
import { RoutePath } from '@/types/router';
import { __DEV__ } from '@/utils/env';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export const HomeOverlayContent = () => {
  const preferredView = useSelector(selectPreferredView);
  const [isRoleSelectModalOpen, setIsRoleSelectModalOpen] = useState(false);

  const dispatch = useDispatch();
  return (
    <MoveUpIn duration={0.4} delay={0.1} y={20}>
      <div className="row mb-4">
        <div className="card">
          <p className="text-sm">Domain</p>
          <p className="mb-2.5 font-bold">BrightID</p>
          <p className="text-sm">Energy Team</p>
          <p className="mb-5 font-bold">Core</p>
          <button className="btn">Change</button>
        </div>
        <div className="card">
          <p className="mb-5">Preferred view</p>
          <img
            className="icon mx-auto mb-7 !h-10 !w-10"
            src={preferredViewIcon[preferredView]}
            alt=""
          />
          <span className="mt-auto flex w-full items-center justify-between">
            <p className="font-bold">{preferredView}</p>
            <Button size="icon" onClick={() => setIsRoleSelectModalOpen(true)}>
              <img src="/assets/images/Dashboard/refresh-icon.svg" alt="" />
            </Button>
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
            {' '}
            <br /> Settings
          </p>
        </div>
        {(__DEV__ ||
          process.env.VITE_REACT_APP_IS_CYPRESS === 'true' ||
          process.env.REACT_APP_ENABLE_LOGOUT === 'true') && (
          <button
            className={'btn'}
            onClick={() => dispatch(resetStore())}
            data-testid="logout-button"
          >
            Logout
          </button>
        )}
      </div>
      <Modal
        title={'Role Selection'}
        isOpen={isRoleSelectModalOpen}
        noButtonPadding={true}
        closeModalHandler={() => setIsRoleSelectModalOpen(false)}
        className="select-button-with-modal__modal"
      >
        <RoleSelectModal
          closeModalHandler={() => setIsRoleSelectModalOpen(false)}
        />
      </Modal>
    </MoveUpIn>
  );
};
