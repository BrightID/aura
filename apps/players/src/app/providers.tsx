import UpdatePrompt from '@/components/Shared/UpdatePrompt';
import { Toaster } from '@/components/ui/toaster';
import { BrowserHistoryContextProvider } from '@/contexts/BrowserHistoryContext';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { RefreshEvaluationsContextProvider } from '@/contexts/RefreshEvaluationsContext';
import { SubjectsListContextProvider } from '@/contexts/SubjectsListContext';
import { configureAppStore } from '@/store';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import NodeApiGateContextProvider from '@/BrightID/components/NodeApiGate';

const { persistor, store } = configureAppStore();

export default function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <RefreshEvaluationsContextProvider>
          <Toaster />
          <UpdatePrompt />
          {children}
        </RefreshEvaluationsContextProvider>
      </PersistGate>
    </Provider>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MyEvaluationsContextProvider>
      <SubjectsListContextProvider>
        <NodeApiGateContextProvider>
          <BrowserHistoryContextProvider>
            {children}
          </BrowserHistoryContextProvider>
        </NodeApiGateContextProvider>
      </SubjectsListContextProvider>
    </MyEvaluationsContextProvider>
  );
}
