import { setupServer } from 'msw/node';
import {
  BRIGHTID_BACKUP,
  findRoleVerification,
  TEST_BRIGHT_ID,
} from '../utils/api/profile';
import ProfileHeaderCard from '@/app/routes/_app.home/components/ProfileHeaderCard';
import { act, screen, waitFor } from '@testing-library/react';
import { compactFormat } from '@/utils/number';
import { calculateUserScorePercentage } from '@/utils/score';
import { EvaluationCategory } from '@/types/dashboard';
import { backupInterceptor, profileInterceptor } from '../utils/api/server';
import { renderWithRouterAndRedux } from '../utils/app';

export const restHandlers = [profileInterceptor, backupInterceptor];

const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Profile Card Header component', () => {
  it('Should render the component', async () => {
    await act(() => {
      renderWithRouterAndRedux(
        <ProfileHeaderCard subjectId={TEST_BRIGHT_ID} />,
        {
          router: { initialEntries: ['/home'] },
        },
      );
    });

    expect(screen.getByTestId('profile-name')).toBeInTheDocument();
    expect(screen.getByTestId('profile-name')).toHaveTextContent(
      BRIGHTID_BACKUP.userData.name,
    );

    const levelElement = screen.getByTestId('profile-level');
    const scoreElement = screen.getByTestId('profile-score');

    const verificationRole = findRoleVerification('player')!;
    const progressElement = screen.getByTestId('profile-progressbar');

    await waitFor(() => {
      expect(levelElement).toHaveTextContent(verificationRole.level.toString());
      expect(scoreElement).toHaveTextContent(
        compactFormat(verificationRole.score),
      );

      expect(progressElement).toHaveStyle(
        `width: ${calculateUserScorePercentage(EvaluationCategory.PLAYER, verificationRole.score)}%`,
      );
    });
  });
});
