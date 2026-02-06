import { useSubjectName } from 'hooks/useSubjectName';
import { Link } from 'react-router';
import { PlayerHistorySequenceType } from 'types';
import { RoutePath } from 'types/router';

import { subjectViewAsIconColored } from '../../constants';
import { Fragment } from 'react/jsx-runtime';

export const PlayerHistorySequence = ({
  playerHistorySequence,
}: {
  playerHistorySequence: PlayerHistorySequenceType[];
}) => {
  return (
    <div className="flex w-full rounded bg-primary-l1 dark:bg-primary-d2">
      <div
        className="rtl: flex min-w-full flex-row gap-1.5 overflow-auto py-3 first:pr-2.5 last:pl-2.5"
        // TODO: refactor this to tailwindcss class
        style={{
          overflow: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#A982DF #f5f5f5',
        }}
      >
        {playerHistorySequence.map((item, i) => (
          <Fragment key={i}>
            <PlayerHistoryItem item={item} />
            {i !== playerHistorySequence.length - 1 && (
              <img src="/assets/images/Header/play-icon.svg" alt="" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const PlayerHistoryItem = ({ item }: { item: PlayerHistorySequenceType }) => {
  const name = useSubjectName(item.subjectId);
  return (
    <Link
      to={
        RoutePath.SUBJECT_PROFILE.replace(':subjectIdProp', item.subjectId) +
        '?viewas=' +
        item.evaluationCategory
      }
      className="flex items-center gap-1"
    >
      <img
        src={subjectViewAsIconColored[item.evaluationCategory]}
        alt=""
        width="10px"
        height="10px"
      />
      <p className="mr-1.5 whitespace-nowrap text-xs text-black">{name}</p>
    </Link>
  );
};
