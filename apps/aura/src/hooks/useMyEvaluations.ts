import { useOutboundEvaluations } from 'hooks/useSubjectEvaluations';
import { useProfileStore } from '@/store/profile.store';

export const useMyEvaluations = () => {
  const authData = useProfileStore((s) => s.authData);
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
