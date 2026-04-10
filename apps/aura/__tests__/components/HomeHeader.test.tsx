import HomeHeader from '@/app/routes/_app.home/components/header';
import { act, screen } from '@testing-library/react';
import { backupInterceptor, profileInterceptor } from '../utils/api/server';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../utils/redux';
import { MemoryRouter } from 'react-router';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { RefreshEvaluationsContextProvider } from '@/contexts/RefreshEvaluationsContext';

export const restHandlers = [profileInterceptor, backupInterceptor];

const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Home Header', () => {
  it('should render with correct roles', async () => {
    await act(() => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/home']}>
          <RefreshEvaluationsContextProvider>
            <MyEvaluationsContextProvider>
              <HomeHeader />
            </MyEvaluationsContextProvider>
          </RefreshEvaluationsContextProvider>
        </MemoryRouter>,
        {},
      );
    });

    expect(screen.getByTestId('hometab-Player')).toBeInTheDocument();
    expect(screen.queryByTestId('hometab-Trainer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hometab-Manager')).not.toBeInTheDocument();
  });

  it('Should render with trainer role', async () => {});
});
