import { SubjectCardMemo } from 'components/EvaluationFlow/SubjectCard';
import { SubjectListControls } from 'components/EvaluationFlow/SubjectListControls';
import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import { SubjectInboundEvaluationsContextProvider } from 'contexts/SubjectInboundEvaluationsContext';
import useViewMode from 'hooks/useViewMode';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from '@/store/hooks';
import { useNavigate, useSearchParams } from 'react-router';
import { RoutePath } from 'types/router';
import { useLevelupProgress } from '@/utils/score';

import ProfileHeaderCard from './components/ProfileHeaderCard';
import ProfileInfoPerformance from './components/ProfileInfoPerformance';
import { LoadingList } from '@/components/Shared/EmptyAndLoadingStates/LoadingList';
import InfiniteScrollLocal from '@/components/InfiniteScrollLocal';
import LevelUp from '@/components/LevelUp';
import { EmptySubjectList } from '@/components/Shared/EmptyAndLoadingStates/EmptySubjectList';
import { ToggleInput } from '@/components/Shared/ToggleInput';
import { useSubjectsListContext } from '@/contexts/SubjectsListContext';
import { selectAuthData } from '@/store/profile/selectors';
import { hash } from '@/utils/crypto';
import { getBrightIdBackupThunk } from '@/store/profile/actions';
import HomeHeader from './components/header';

const Home = () => {
  const color = {
    Player: 'pastel-green',
    Trainer: 'pastel-orange',
    Manager: 'pastel-blue',
  };
  const [isEvaluate, setIsEvaluate] = useState(true);
  const [query] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (query.get('tab') === 'evaluate') {
      setIsEvaluate(true);
    }

    if (query.get('tab') === 'levelup') {
      setIsEvaluate(false);
    }
  }, [query, navigate]);

  const authData = useSelector(selectAuthData);
  const { currentRoleEvaluatorEvaluationCategory } = useViewMode();

  const {
    itemsFiltered: filteredSubjects,
    selectedFilterIds,
    clearSortAndFilter,
  } = useSubjectsListContext();

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const refreshBrightIdBackup = useCallback(async () => {
    if (!authData) return;
    setLoading(true);
    const authKey = hash(authData.brightId + authData.password);
    await dispatch(getBrightIdBackupThunk({ authKey }));
    setLoading(false);
  }, [authData, dispatch]);

  const { loading: loadingMyEvaluations } = useMyEvaluationsContext();

  const { isUnlocked, reason } = useLevelupProgress({
    evaluationCategory: currentRoleEvaluatorEvaluationCategory,
  });

  useEffect(() => {
    if (!authData?.brightId) navigate('/');
  }, [authData, navigate]);

  if (!authData?.brightId) {
    return <div>Not logged in</div>;
  }

  return loadingMyEvaluations ? (
    <LoadingList />
  ) : (
    <SubjectInboundEvaluationsContextProvider subjectId={authData.brightId}>
      <div id="scrollable-div" className="page flex flex-col gap-4">
        <ProfileHeaderCard subjectId={authData.brightId} />
        <ProfileInfoPerformance
          subjectId={authData.brightId}
          isPerformance={true}
          color={color.Player}
        />

        <ToggleInput
          tooltipFirstTab="Find users to rate"
          tooltipSecondTab="Advance your score"
          option1={'Evaluate'}
          option2={'Level Up'}
          isChecked={isEvaluate}
          disabledHelpText={reason}
          setIsChecked={(isEvaluate) => {
            navigate(
              RoutePath.HOME + `?tab=${isEvaluate ? 'evaluate' : 'levelup'}`,
            );
          }}
          option2Disabled={!isUnlocked}
        />
        {isEvaluate ? (
          <div>
            <SubjectListControls
              loading={loading}
              refreshBrightIdBackup={refreshBrightIdBackup}
            />
            {filteredSubjects && !loading ? (
              filteredSubjects.length > 0 ? (
                <div className="no-scrollbar flex-grow overflow-auto">
                  <InfiniteScrollLocal
                    getScrollParent={() =>
                      document.getElementById('scrollable-div')
                    }
                    className={'flex flex-col gap-3'}
                    items={filteredSubjects}
                    renderItem={(conn, index) => (
                      <SubjectCardMemo
                        verifications={conn.verifications}
                        key={conn.id}
                        index={index}
                        subjectId={conn.id}
                      />
                    )}
                  />
                </div>
              ) : (
                <EmptySubjectList
                  clearSortAndFilter={clearSortAndFilter}
                  hasFilter={selectedFilterIds !== null}
                  showConnectionGuide={true}
                />
              )
            ) : (
              <LoadingList />
            )}
          </div>
        ) : (
          <LevelUp subjectId={authData.brightId} />
        )}
      </div>
    </SubjectInboundEvaluationsContextProvider>
  );
};

const HomePage = () => {
  return (
    <>
      <HomeHeader />
      <Home />
    </>
  );
};

export default HomePage;
