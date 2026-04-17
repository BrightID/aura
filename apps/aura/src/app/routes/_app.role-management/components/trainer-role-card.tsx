import { useSubjectVerifications } from '@/hooks/useSubjectVerifications';
import { useSettingsStore, RoleStatus } from '@/store/settings.store';
import { EvaluationCategory } from '@/types/dashboard';
import { RefreshCcw } from 'lucide-react';
import { FC } from 'react';
import { SubjectIdProps } from './player-role-card';
import PlayerLevelAndScore from './score-and-level';

const TrainerRoleCard: FC<SubjectIdProps> = ({ subjectId }) => {
  const trainerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.TRAINER,
  );
  const hasTrainerRole = useSettingsStore((s) => s.hasTrainerRole !== RoleStatus.HIDE);
  const toggleTrainerRole = useSettingsStore((s) => s.toggleTrainerRole);

  const playerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.PLAYER,
  );

  const isAuthorized =
    !!playerEvaluation.auraLevel && playerEvaluation.auraLevel >= 2;

  return (
    <div className="relative flex min-h-[150px] cursor-pointer flex-col gap-3.5 rounded-lg bg-card py-[18px] pb-4 pl-5 pr-6">
      <img
        src="/assets/images/RoleManagement/trainer-shadow-icon.svg"
        alt=""
        className="absolute left-0 top-0"
      />
      <section className="flex justify-between">
        <div className="flex gap-2 text-black dark:text-white">
          <img src="/assets/images/Shared/trainer.svg" alt="" />
          <div>
            <p className="text-[20px] font-medium dark:text-white">Trainer</p>
          </div>
        </div>
        <PlayerLevelAndScore
          loading={trainerEvaluation.loading}
          level={trainerEvaluation.auraLevel}
          score={trainerEvaluation.auraScore}
          color="text-pastel-green"
        />
      </section>
      {!isAuthorized ? (
        <>
          <section>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium">
              <img src="/assets/images/RoleManagement/item.svg" alt="" />

              <p
                data-testid="trainer-levelup-requirement"
                className="dark:text-white"
              >
                Reach Player level 2 to unlock
              </p>
              <span className="font-bold dark:text-white"> Trainer </span>
            </div>
          </section>
        </>
      ) : null}

      <div className="mt-3 flex">
        {isAuthorized || (
          <a-button
            variant="ghost"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            onClick={playerEvaluation.refresh}
            disabled={playerEvaluation.isFetching}
          >
            <RefreshCcw
              className={playerEvaluation.isFetching ? 'animate-spin' : ''}
              size={16}
            />
            Refresh
          </a-button>
        )}
      </div>
      {isAuthorized && (
        <section className="mt-auto flex justify-end">
          {hasTrainerRole ? (
            <a-button
              data-testid="trainer-role-hide-btn"
              color="destructive"
              onClick={() => toggleTrainerRole()}
            >
              Hide
            </a-button>
          ) : (
            <a-button
              data-testid="trainer-role-show-btn"
              variant="secondary"
              className="bg-pl4"
              onClick={() => toggleTrainerRole()}
            >
              Show
            </a-button>
          )}
        </section>
      )}
    </div>
  );
};

export default TrainerRoleCard;
