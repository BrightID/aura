import { useSubjectVerifications } from '@/hooks/useSubjectVerifications';
import { EvaluationCategory } from '@/types/dashboard';
import { FC } from 'react';
import PlayerLevelAndScore from './score-and-level';

export interface SubjectIdProps {
  subjectId: string;
}

const PlayerRoleCard: FC<SubjectIdProps> = ({ subjectId }) => {
  const playerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.PLAYER,
  );

  return (
    <div className="relative flex min-h-[150px] cursor-pointer flex-col gap-3.5 rounded-lg bg-card py-[18px] pb-4 pl-5 pr-6">
      <img
        src="/assets/images/RoleManagement/player-shadow-icon.svg"
        alt=""
        className="absolute left-0 top-0"
      />
      <section className="flex justify-between">
        <div className="flex gap-2">
          <img src="/assets/images/Shared/player.svg" alt="" />
          <div>
            <p className="text-[20px] font-medium dark:text-white">Player</p>
          </div>
        </div>
        <PlayerLevelAndScore
          level={playerEvaluation.auraLevel}
          loading={playerEvaluation.loading}
          score={playerEvaluation.auraScore}
          color="text-pastel-purple"
        />
      </section>

      <section className="mt-auto flex justify-between text-black dark:text-white"></section>
    </div>
  );
};

export default PlayerRoleCard;
