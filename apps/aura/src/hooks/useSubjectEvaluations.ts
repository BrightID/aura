import { skipToken } from '@reduxjs/toolkit/query/react';
import { useMemo } from 'react';
import {
  useGetInboundConnectionsQuery,
  useGetOutboundConnectionsQuery,
} from 'store/api/connections';

import { selectEvaluateOperations } from '../BrightID/reducer/operationsSlice';
import { pendingOperationStates } from '../constants';
import { useSelector } from '../store/hooks';
import { AuraRating } from '../types';
import { EvaluationCategory, EvaluationValue } from '../types/dashboard';

export const useInboundEvaluations = ({
  subjectId,
  evaluationCategory,
}: {
  subjectId: string | null | undefined;
  evaluationCategory?: EvaluationCategory;
}) => {
  const {
    data,
    isLoading: loading,
    refetch,
  } = useGetInboundConnectionsQuery(subjectId ? { id: subjectId } : skipToken);

  const operations = useSelector(selectEvaluateOperations);

  const inboundRatings: AuraRating[] | null = useMemo(() => {
    if (!data || !subjectId) return null;
    const pendingRatings: AuraRating[] = [];
    operations
      .filter(
        (op) =>
          (evaluationCategory === undefined ||
            op.category === evaluationCategory) &&
          op.evaluated === subjectId &&
          pendingOperationStates.includes(op.state),
      )
      .reverse()
      .forEach((ratingOp) => {
        if (
          pendingRatings.findIndex(
            (pr) =>
              pr.toBrightId === ratingOp.evaluated &&
              pr.category === ratingOp.category,
          ) === -1
        ) {
          pendingRatings.unshift({
            rating: `${
              ratingOp.evaluation === EvaluationValue.NEGATIVE ? '-' : ''
            }${ratingOp.confidence}`,
            category: ratingOp.category,
            fromBrightId: ratingOp.evaluator,
            toBrightId: ratingOp.evaluated,
            isPending: true,
            createdAt: new Date(ratingOp.timestamp).toISOString(),
            updatedAt: new Date(ratingOp.timestamp).toISOString(),
            timestamp: ratingOp.timestamp,
          });
        }
      });

    return data
      .reduce(
        (a, c) =>
          a.concat(
            ...(c.auraEvaluations
              ?.filter(
                (r) =>
                  (evaluationCategory === undefined ||
                    r.category === evaluationCategory) &&
                  pendingRatings.findIndex(
                    (pr) =>
                      pr.fromBrightId === c.id && pr.category === r.category,
                  ) === -1,
              )
              .map((e) => ({
                fromBrightId: c.id,
                toBrightId: subjectId,
                rating: String(
                  (e.evaluation === EvaluationValue.POSITIVE ? 1 : -1) *
                    e.confidence,
                ),
                category: e.category,
                id: 0,
                createdAt: new Date(e.modified || c.timestamp).toISOString(),
                updatedAt: new Date(e.modified || c.timestamp).toISOString(),
                timestamp: e.modified || c.timestamp,
                isPending: false,
                verifications: c.verifications,
              })) ?? []),
          ),
        [] as AuraRating[],
      )
      .concat(pendingRatings)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [evaluationCategory, data, operations, subjectId]);

  const inboundPositiveRatingsCount = useMemo(
    () => inboundRatings?.filter((r) => Number(r.rating) > 0).length,
    [inboundRatings],
  );
  const inboundNegativeRatingsCount = useMemo(
    () => inboundRatings?.filter((r) => Number(r.rating) < 0).length,
    [inboundRatings],
  );

  const inboundRatingsStatsString = useMemo(() => {
    return `${inboundPositiveRatingsCount ?? '...'} Pos / ${
      inboundNegativeRatingsCount ?? '...'
    } Neg`;
  }, [inboundNegativeRatingsCount, inboundPositiveRatingsCount]);

  return {
    connections: data,
    refreshInboundRatings: refetch,
    loading,
    ratings: inboundRatings,
    inboundPositiveRatingsCount,
    inboundNegativeRatingsCount,
    inboundRatingsStatsString,
  };
};

export const useOutboundEvaluations = ({
  subjectId,
  evaluationCategory,
}: {
  subjectId: string | null | undefined;
  evaluationCategory?: EvaluationCategory;
}) => {
  const {
    data,
    refetch,
    isLoading: loading,
  } = useGetOutboundConnectionsQuery(subjectId ? { id: subjectId } : skipToken);

  const operations = useSelector(selectEvaluateOperations);
  const outboundRatings: AuraRating[] | null = useMemo(() => {
    if (!data || !subjectId) return null;
    const pendingRatings: AuraRating[] = [];
    operations
      .filter(
        (op) =>
          (evaluationCategory === undefined ||
            op.category === evaluationCategory) &&
          op.evaluator === subjectId &&
          pendingOperationStates.includes(op.state),
      )
      .reverse()
      .forEach((ratingOp) => {
        if (
          pendingRatings.findIndex(
            (pr) =>
              pr.toBrightId === ratingOp.evaluated &&
              pr.category === ratingOp.category,
          ) === -1
        ) {
          pendingRatings.unshift({
            rating: `${
              ratingOp.evaluation === EvaluationValue.NEGATIVE ? '-' : ''
            }${ratingOp.confidence}`,
            category: ratingOp.category,
            fromBrightId: ratingOp.evaluator,
            toBrightId: ratingOp.evaluated,
            isPending: true,
            createdAt: new Date(ratingOp.timestamp).toISOString(),
            updatedAt: new Date(ratingOp.timestamp).toISOString(),
            timestamp: ratingOp.timestamp,
          });
        }
      });
    return data
      .reduce(
        (a, c) =>
          a.concat(
            ...(c.auraEvaluations
              ?.filter(
                (r) =>
                  (evaluationCategory === undefined ||
                    r.category === evaluationCategory) &&
                  pendingRatings.findIndex(
                    (pr) =>
                      pr.toBrightId === c.id && pr.category === r.category,
                  ) === -1,
              )
              .map((e) => ({
                fromBrightId: subjectId,
                toBrightId: c.id,
                rating: String(
                  (e.evaluation === EvaluationValue.POSITIVE ? 1 : -1) *
                    e.confidence,
                ),
                category: e.category,
                id: 0,
                createdAt: new Date(e.modified || c.timestamp).toISOString(),
                updatedAt: new Date(e.modified || c.timestamp).toISOString(),
                timestamp: e.modified || c.timestamp,
                isPending: false,
                verifications: c.verifications,
              })) ?? []),
          ),
        [] as AuraRating[],
      )
      .concat(pendingRatings)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [evaluationCategory, operations, data, subjectId]);

  return {
    loading,
    connections: data,
    refreshOutboundRatings: refetch,
    ratings: outboundRatings,
  };
};

export const useSubjectEvaluations = (props: {
  subjectId: string | null | undefined;
  evaluationCategory?: EvaluationCategory;
}) => {
  const inboundConnectionsData = useInboundEvaluations(props);
  const outboundConnectionsData = useOutboundEvaluations(props);
  return { ...inboundConnectionsData, ...outboundConnectionsData };
};
