import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

// Define the context
export const RefreshEvaluationsContext = createContext<{
  refreshCounter: number;
  refreshEvaluations: () => void;
} | null>(null);

interface ProviderProps {
  children: ReactNode;
}

// Define the Provider component
export const RefreshEvaluationsContextProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const refreshEvaluations = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);
  return (
    <RefreshEvaluationsContext.Provider
      value={{
        refreshCounter,
        refreshEvaluations,
      }}
    >
      {children}
    </RefreshEvaluationsContext.Provider>
  );
};

export const useRefreshEvaluationsContext = () => {
  const context = useContext(RefreshEvaluationsContext);
  if (context === null) {
    throw new Error(
      'RefreshEvaluationsContext must be used within a RefreshEvaluationsContextProvider',
    );
  }
  return context;
};
