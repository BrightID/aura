import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

import {
  EvaluateSubmittedOperation,
  selectEvaluateOperations,
} from '@/BrightID/reducer/operationsSlice';
import { operation_states } from '../BrightID/utils/constants';
import {
  getBgClassNameOfAuraRatingNumber,
  getViewModeSubjectBorderColorClass,
  subjectViewAsIconColored,
  viewAsToViewMode,
} from '../constants';
import { useRefreshEvaluationsContext } from '../contexts/RefreshEvaluationsContext';
import { useSubjectName } from '../hooks/useSubjectName';
import { useDispatch, useSelector } from '../store/hooks';
import BrightIdProfilePicture from './BrightIdProfilePicture';
import EvaluationThumb from './Shared/EvaluationThumb';
import { connectionsApi } from '@/store/api/connections';
import { profileApi } from '@/store/api/profile';

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
      {/*TODO: Handle failed notifications*/}
      {/*<div className="flex w-full justify-between items-center">*/}
      {/*<div className="flex gap-0.5">*/}
      {/*  <p className="font-medium text-sm text-nl3">Try Again</p>*/}
      {/*  <img src="/assets/images/Shared/refresh-red.svg" alt="" />*/}
      {/*</div>*/}
      {/*</div>*/}
    </div>
  );
}

export default function EvaluationOpNotifications() {
  const operations = useSelector(selectEvaluateOperations);

  const prevOperationsRef = useRef<EvaluateSubmittedOperation[] | null>(null);
  const dispatch = useDispatch();

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
      console.log({
        currentNotifications,
        id,
      });
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
  const { refreshEvaluations } = useRefreshEvaluationsContext();
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
          dispatch(connectionsApi.util.invalidateTags([{ type: 'BrightID' }]));

          dispatch(profileApi.util.invalidateTags([{ type: 'BrightID' }]));

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

    // Update ref and localStorage with the latest operations
    prevOperationsRef.current = operations;
    localStorage.setItem('prevOperations', JSON.stringify(operations));
  }, [addNotification, operations, refreshEvaluations, dispatch]);

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
