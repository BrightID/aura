import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

import {
  EvaluateSubmittedOperation,
  selectEvaluateOperations,
  useOperationsStore,
} from '@/store/operations.store';
import { operation_states } from '../BrightID/utils/constants';
import {
  getBgClassNameOfAuraRatingNumber,
  getViewModeSubjectBorderColorClass,
  subjectViewAsIconColored,
  viewAsToViewMode,
} from '../constants';
import { useRefreshStore } from '@/store/refresh.store';
import { useSubjectName } from '../hooks/useSubjectName';
import BrightIdProfilePicture from './BrightIdProfilePicture';
import EvaluationThumb from './Shared/EvaluationThumb';
import { queryClient } from '@/lib/queryClient';

type EvaluateOpNotificationData = {
  text: string;
  operation: EvaluateSubmittedOperation;
};

function EvaluateOpNotification({
  notification,
  dismiss,
}: {
  notification: EvaluateOpNotificationData;
  dismiss: () => void;
}) {
  const subjectName = useSubjectName(notification.operation.evaluated);
  return (
    <div className="card flex flex-col gap-1 !border-neutral-l3 !bg-neutral-l2">
      <div className="flex w-full items-center justify-between">
        <Link
          className="flex items-center gap-2"
          to={
            '/subject/' +
            notification.operation.evaluated +
            '?viewas=' +
            notification.operation.category
          }
        >
          <img
            src="/assets/images/Shared/close-filled-red.svg"
            className="cursor-pointer"
            onClick={dismiss}
            alt=""
          />
          <BrightIdProfilePicture
            subjectId={notification.operation.evaluated}
            className={`h-4 w-4 rounded border border-solid ${getViewModeSubjectBorderColorClass(
              viewAsToViewMode[notification.operation.category],
            )}`}
          />
          <div>{subjectName}</div>
          <img
            src={subjectViewAsIconColored[notification.operation.category]}
            className="h-4 w-4"
            alt=""
          />
          <div
            className={`flex items-center gap-1 rounded px-3 py-1 ${getBgClassNameOfAuraRatingNumber(
              notification.operation.confidence,
            )}`}
          >
            <EvaluationThumb
              rating={notification.operation.confidence}
              className="h-3.5 w-3.5"
              alt=""
            />
            <span
              className={`text-xs font-medium ${
                Math.abs(notification.operation.confidence) > 2
                  ? 'text-white'
                  : 'text-black'
              }`}
            >
              (
              {notification.operation.confidence > 0
                ? `+${notification.operation.confidence}`
                : notification.operation.confidence}
              )
            </span>
          </div>
        </Link>
        <p className="text-sm font-bold text-button-primary">
          {notification.text}
        </p>
      </div>
    </div>
  );
}

export default function EvaluationOpNotifications() {
  // Subscribe to operations store to react to changes
  useOperationsStore((s) => s);
  const operations = selectEvaluateOperations();

  const prevOperationsRef = useRef<EvaluateSubmittedOperation[] | null>(null);

  useEffect(() => {
    const storedOperations = localStorage.getItem('prevOperations');
    if (storedOperations) {
      prevOperationsRef.current = JSON.parse(
        storedOperations,
      ) as EvaluateSubmittedOperation[];
    }
  }, []);

  const [notifications, setNotifications] = useState<
    (EvaluateOpNotificationData & {
      id: string;
    })[]
  >([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((currentNotifications) => {
      return currentNotifications.filter((n) => n.id !== id);
    });
  }, []);

  const addNotification = useCallback(
    (data: EvaluateOpNotificationData) => {
      const newId = uuidv4();
      setNotifications((currentNotifications) =>
        currentNotifications.concat([
          {
            id: newId,
            ...data,
          },
        ]),
      );
      if (data.operation.state !== operation_states.FAILED) {
        setTimeout(() => removeNotification(newId), 5000);
      }
    },
    [removeNotification],
  );
  const { refreshEvaluations } = useRefreshStore();
  useEffect(() => {
    const prevOperations = prevOperationsRef.current;
    if (prevOperations) {
      operations.forEach((operation) => {
        const prevOperation = prevOperations.find(
          (op) => op.hash === operation.hash,
        );
        if (!prevOperation) {
          addNotification({
            operation,
            text: `Waiting...`,
          });
        } else if (
          prevOperation.state !== operation_states.APPLIED &&
          operation.state === operation_states.APPLIED
        ) {
          queryClient.invalidateQueries({ queryKey: ['connections'] });
          queryClient.invalidateQueries({ queryKey: ['brightid-profile'] });
          queryClient.invalidateQueries({ queryKey: ['connections-info'] });

          addNotification({
            operation,
            text: `Applied!`,
          });
          refreshEvaluations();
        } else if (
          prevOperation.state !== operation_states.FAILED &&
          operation.state === operation_states.FAILED
        ) {
          addNotification({
            operation,
            text: `Failed!`,
          });
        }
      });
    }

    prevOperationsRef.current = operations;
    localStorage.setItem('prevOperations', JSON.stringify(operations));
  }, [addNotification, operations, refreshEvaluations]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <EvaluateOpNotification
            key={notification.id}
            notification={notification}
            dismiss={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
