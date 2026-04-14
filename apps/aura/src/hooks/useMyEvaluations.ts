import { useOutboundEvaluations } from 'hooks/useSubjectEvaluations';
import { useSelector } from 'react-redux';
import { selectAuthData } from 'store/profile/selectors';

export const useMyEvaluations = () => {
  const authData = useSelector(selectAuthData);
  const outboundEvaluations = useOutboundEvaluations({
    subjectId: authData?.brightId,
  });

  return {
    loading: outboundEvaluations.loading,
    refreshOutboundRatings: outboundEvaluations.refreshOutboundRatings,
    myRatings: outboundEvaluations.ratings,
    myConnections: outboundEvaluations.connections,
  };
};
