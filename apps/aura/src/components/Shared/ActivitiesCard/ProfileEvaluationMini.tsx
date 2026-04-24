import EvaluationInfo from 'components/Shared/EvaluationInfo/EvaluationInfo';
import { useSubjectName } from 'hooks/useSubjectName';
import { useSubjectVerifications } from 'hooks/useSubjectVerifications';
import { MdRateReview, MdStar } from 'react-icons/md';
import { compactFormat } from '@/utils/number';

import {
  viewModeToSubjectViewMode,
  viewModeToViewAs,
} from '../../../constants';
import useViewMode from '../../../hooks/useViewMode';
import { EvaluationCategory } from '../../../types/dashboard';
import BrightIdProfilePicture from '@/components/Shared/BrightIdProfilePicture';
import Tooltip from '../Tooltip';

const ProfileEvaluationMini = ({
  fromSubjectId,
  toSubjectId,
  onClick,
  evaluationCategory,
}: {
  fromSubjectId: string;
  toSubjectId: string;
  onClick?: () => void;
  evaluationCategory: EvaluationCategory;
}) => {
  const name = useSubjectName(toSubjectId);
  const { currentViewMode } = useViewMode();
  const { auraLevel, auraScore } = useSubjectVerifications(
    toSubjectId,
    viewModeToViewAs[viewModeToSubjectViewMode[currentViewMode]],
  );
  return (
    <div
      className={`card gap-2 !bg-opacity-100 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex w-full items-center">
        <BrightIdProfilePicture
          className={`card--header__left__avatar h-10 w-10 rounded border border-pastel-purple`}
          subjectId={toSubjectId}
        />
        <p className="ml-1.5 font-bold">{name}</p>
        <div className="ml-auto rounded bg-gray00 px-2 py-1.5">
          <p className="text-sm font-bold text-light-orange">
            <Tooltip content={'level'} className="mr-10">
              <div className="flex items-center gap-1">
                <MdStar />
                {auraLevel}
              </div>
            </Tooltip>
            <Tooltip content="score">
              <div className="flex items-center gap-1">
                <MdRateReview />
                {auraScore ? compactFormat(auraScore) : '-'}
              </div>
            </Tooltip>
          </p>
        </div>
      </div>
      <EvaluationInfo
        fromSubjectId={fromSubjectId}
        toSubjectId={toSubjectId}
        evaluationCategory={evaluationCategory}
      />
    </div>
  );
};

export default ProfileEvaluationMini;
