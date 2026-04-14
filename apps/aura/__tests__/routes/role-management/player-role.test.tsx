import { setupServer } from 'msw/node';
import {
  profileInterceptor,
  backupInterceptor,
  makeMockProfileData,
} from '../../utils/api/server';
import { Verifications } from '@/api/auranode.service';
import {
  generateEvaluationImpact,
  generateRandomBrightId,
  generateRoleData,
  TEST_BRIGHT_ID,
} from '../../utils/api/profile';
import PlayerRoleCard from '@/app/routes/_app.role-management/components/player-role-card';
import { renderWithRouterAndRedux } from '../../utils/app';
import { act, screen, waitFor } from '@testing-library/react';
import { compactFormat } from '@/utils/number';
import ManagerRoleCard from '@/app/routes/_app.role-management/components/manager-role-card';
import userEvent from '@testing-library/user-event';

describe('Player XP and Level', () => {
  const evaluations = Array.from({ length: 10 }).map(() =>
    generateEvaluationImpact(
      generateRandomBrightId(),
      Math.random() * 300 * 10 ** 6,
    ),
  );

  const playerRole = {
    name: 'player',
    level: 2,
    impacts: evaluations,
    score: evaluations.reduce((prev, curr) => prev + curr.score, 0),
  };

  const mockedBrightIdProfileData = {
    data: {
      id: TEST_BRIGHT_ID,
      sponsored: true,
      verifications: [
        {
          name: 'Aura',
          block: 30146400,
          timestamp: 1740282045881,
          domains: [
            {
              name: 'BrightID',
              categories: [generateRoleData('subject'), playerRole],
            },
          ],
        },
      ] as Verifications,
      recoveryConnections: [],
      connectionsNum: 11,
      groupsNum: 0,
      reports: [],
      createdAt: new Date().getTime(),
      signingKeys: [],
      requiredRecoveryNum: 2,
    },
  };

  const restHandlers = [
    makeMockProfileData({ ...mockedBrightIdProfileData }),
    backupInterceptor,
  ];

  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('Should render the correct level and score for player', async () => {
    renderWithRouterAndRedux(<PlayerRoleCard subjectId={TEST_BRIGHT_ID} />, {});

    await waitFor(() => {
      expect(screen.getByTestId('role-card-score')).toHaveTextContent(
        compactFormat(playerRole.score),
      );

      expect(screen.getByTestId('role-card-level')).toHaveTextContent(
        `lvl ${playerRole.level}`,
      );
    });
  });

  it('Should not have show or hide buttons', async () => {
    renderWithRouterAndRedux(<PlayerRoleCard subjectId={TEST_BRIGHT_ID} />, {});
    await waitFor(() => {
      expect(
        screen.queryByTestId('player-role-hide-btn'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('player-role-show-btn'),
      ).not.toBeInTheDocument();
    });
  });
});
