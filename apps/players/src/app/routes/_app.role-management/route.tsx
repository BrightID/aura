import { SubjectInboundConnectionsContextProvider } from 'contexts/SubjectInboundConnectionsContext';
import { SubjectInboundEvaluationsContextProvider } from 'contexts/SubjectInboundEvaluationsContext';
import { SubjectOutboundEvaluationsContextProvider } from 'contexts/SubjectOutboundEvaluationsContext';
import { useSelector } from 'react-redux';

import { selectAuthData } from 'store/profile/selectors';
import DefaultHeader from '@/components/Header/DefaultHeader';
import { Link } from 'react-router';
import PlayerRoleCard from './components/player-role-card';
import TrainerRoleCard from './components/trainer-role-card';
import ManagerRoleCard from './components/manager-role-card';

export default function RoleManagement() {
  const authData = useSelector(selectAuthData);
  const subjectId = authData!.brightId;

  return (
    <>
      <DefaultHeader
        title="Role Management"
        beforeTitle={
          <Link to="/settings">
            <img
              className="mr-2 h-6 w-6"
              src="/assets/images/Header/back.svg"
              alt=""
            ></img>
          </Link>
        }
      />
      <SubjectOutboundEvaluationsContextProvider subjectId={subjectId!}>
        <SubjectInboundEvaluationsContextProvider subjectId={subjectId!}>
          <SubjectInboundConnectionsContextProvider subjectId={subjectId!}>
            <div className="page flex flex-1 flex-col">
              <section className="flex flex-col gap-3">
                <PlayerRoleCard subjectId={subjectId} />
                <TrainerRoleCard subjectId={subjectId} />
                <ManagerRoleCard subjectId={subjectId} />
              </section>

              <section className="mt-auto flex w-full justify-center">
                <p className="text-sm text-white">Aura version {APP_VERSION}</p>
              </section>
            </div>
          </SubjectInboundConnectionsContextProvider>
        </SubjectInboundEvaluationsContextProvider>
      </SubjectOutboundEvaluationsContextProvider>
    </>
  );
}
