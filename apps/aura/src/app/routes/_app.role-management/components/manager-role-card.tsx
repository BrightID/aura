import { useSettingsStore, RoleStatus } from '@/store/settings.store';
import { useSubjectVerifications } from '@/hooks/useSubjectVerifications';
import { EvaluationCategory } from '@/types/dashboard';
import { RefreshCcw } from 'lucide-react';
import { FC } from 'react';
import { SubjectIdProps } from './player-role-card';
import PlayerLevelAndScore from './score-and-level';

const ManagerRoleCard: FC<SubjectIdProps> = ({ subjectId }) => {
  const managerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.MANAGER,
  );

  const trainerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.TRAINER,
  );

  const hasManagerRole = useSettingsStore((s) => s.hasManagerRole !== RoleStatus.HIDE);
  const toggleManagerRole = useSettingsStore((s) => s.toggleManagerRole);

  const hasNotReachedToLevelOne =
    !trainerEvaluation.auraLevel || trainerEvaluation.auraLevel < 1;

  return (
    <div className="relative flex min-h-[150px] cursor-pointer flex-col gap-3.5 rounded-lg bg-card py-[18px] pb-4 pl-5 pr-6">
      <img
        src="/assets/images/RoleManagement/manager-shadow-icon.svg"
        alt=""
        className="absolute left-0 top-0"
      />
      <section className="flex justify-between">
        <div className="flex gap-2">
          <img src="/assets/images/Shared/manager.svg" alt="" />
          <div>
            <p className="text-[20px] font-medium dark:text-white">Manager</p>
          </div>
        </div>
        <PlayerLevelAndScore
          loading={managerEvaluation.loading}
          level={managerEvaluation.auraLevel}
          score={managerEvaluation.auraScore}
          color="text-gray50"
        />
      </section>
      {hasNotReachedToLevelOne ? (
        <>
          <section>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium">
              <img src="/assets/images/RoleManagement/item.svg" alt="" />

              <p
                data-testid="manager-levelup-requirement"
                className="dark:text-white"
              >
                Reach Trainer level 1 to unlock
              </p>
              <span className="font-bold dark:text-white"> Manager </span>
            </div>
          </section>
        </>
      ) : null}
      <div className="mt-3 flex">
        {hasNotReachedToLevelOne && (
          <a-button
            variant="ghost"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            onClick={() => trainerEvaluation.refresh()}
            disabled={trainerEvaluation.isFetching}
          >
            <RefreshCcw
              className={trainerEvaluation.isFetching ? 'animate-spin' : ''}
              size={16}
            />
            Refresh
          </a-button>
        )}
      </div>
      {!hasNotReachedToLevelOne && (
        <section className="mt-auto flex justify-end text-black dark:text-white">
          {hasManagerRole ? (
            <a-button
              data-testid="manager-role-hide-btn"
              color="destructive"
              onClick={() => toggleManagerRole()}
            >
              Hide
            </a-button>
          ) : (
            <a-button
              data-testid="manager-role-show-btn"
              variant="secondary"
              className="bg-pl4"
              onClick={() => toggleManagerRole()}
            >
              Show
            </a-button>
          )}
        </section>
      )}
    </div>
  );
};

export default ManagerRoleCard;
