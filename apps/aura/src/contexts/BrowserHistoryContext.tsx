import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router';

// Define the context
const BrowserHistoryContext = createContext<{
  isFirstVisitedRoute: boolean;
} | null>(null);

interface ProviderProps {
  children: ReactNode;
}

// Define the Provider component
export const BrowserHistoryContextProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const location = useLocation();
  const [firstPagePath, setFirstPagePath] = useState<string | null>(null);

  useEffect(() => {
    setFirstPagePath((value) => value ?? location.pathname);
  }, [location]);

  const isFirstVisitedRoute = useMemo(
    () => !firstPagePath || location.pathname === firstPagePath,
    [firstPagePath, location.pathname],
  );

  return (
    <BrowserHistoryContext.Provider value={{ isFirstVisitedRoute }}>
      {children}
    </BrowserHistoryContext.Provider>
  );
};

export const useBrowserHistoryContext = () => {
  const context = useContext(BrowserHistoryContext);
  if (context === null) {
    throw new Error(
      'BrowserHistoryContext must be used within a BrowserHistoryContextProvider',
    );
  }
  return context;
};
