import { useSubjectInboundConnectionsSetup } from '@/hooks/useSubjectInboundConnectionsContext';
import { useSubjectInboundEvaluationsSetup } from '@/hooks/useSubjectInboundEvaluationsContext';
import { useProfileStore } from '@/store/profile.store';
import DefaultHeader from '@/components/Header/DefaultHeader';
import { Link } from 'react-router';
import PlayerRoleCard from './components/player-role-card';
import TrainerRoleCard from './components/trainer-role-card';
import ManagerRoleCard from './components/manager-role-card';

export default function RoleManagement() {
  const authData = useProfileStore((s) => s.authData);
  const subjectId = authData!.brightId;

  useSubjectInboundEvaluationsSetup(subjectId);
  useSubjectInboundConnectionsSetup(subjectId);

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
    </>
  );
}
