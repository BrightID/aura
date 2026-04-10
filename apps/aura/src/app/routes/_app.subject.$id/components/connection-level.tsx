import { NodeApiContext } from '@/BrightID/components/NodeApiGate';
import {
  addOperation,
  Operation,
  selectOperationByHash,
} from '@/BrightID/reducer/operationsSlice';
import { operation_states } from '@/BrightID/utils/constants';
import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'store/hooks';
import { selectAuthData } from 'store/profile/selectors';

export function ConnectionLevel({ subjectId }: { subjectId: string }) {
  const { myConnectionToSubject: connection } = useMyEvaluationsContext({
    subjectId,
  });

  const dispatch = useDispatch();
  const api = useContext(NodeApiContext);
  const authData = useSelector(selectAuthData);

  const [loading, setLoading] = useState(false);

  const [connectionOpHash, setConnectionOpHash] = useState<string>('');
  const connectionOp = useSelector((state) =>
    selectOperationByHash(state, connectionOpHash),
  );

  const setRandomConnectionLevel = useCallback(async () => {
    setLoading(true);
    if (!connection || !api || !authData) return;
    const level =
      connection.level === 'just met' ? 'already known' : 'just met';
    if (!level) return;
    console.log(`Setting connection level '${level}'`);
    try {
      const op = (await api.addConnection(
        authData.brightId,
        connection.id,
        level,
        Date.now(),
      )) as Operation;
      op.state = operation_states.UNKNOWN;
      dispatch(addOperation(op));
      setConnectionOpHash(op.hash);
    } catch (e) {
      setLoading(false);
      alert(String(e));
    }
  }, [api, authData, connection, dispatch]);

  useEffect(() => {
    async function getData() {
      if (connectionOp?.state === operation_states.APPLIED) {
        window.location.reload();
      }
    }

    getData();
  }, [authData, connectionOp?.state, dispatch]);

  return (
    <div className="card flex flex-col gap-2.5 dark:bg-dark-primary">
      [Only shown in DEV mode]{' '}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {connection?.level ?? '...'}
          <button onClick={setRandomConnectionLevel}>Change</button>
        </div>
      )}
    </div>
  );
}
