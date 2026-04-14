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
import TrainerRoleCard from '@/app/routes/_app.role-management/components/trainer-role-card';

describe('Trainer XP and Level', () => {
  const evaluations = Array.from({ length: 10 }).map(() =>
    generateEvaluationImpact(
      generateRandomBrightId(),
      Math.random() * 300 * 10 ** 6,
    ),
  );

  const trainerRole = {
    name: 'trainer',
    level: 1,
    impacts: evaluations,
    score: evaluations.reduce((prev, curr) => prev + curr.score, 0),
  };

  const playerRole = {
    name: 'player',
    level: 2,
    impacts: [],
    score: 5000000,
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
              categories: [
                playerRole,
                generateRoleData('subject'),
                trainerRole,
              ],
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

  it('Should render the correct level and score for trainer', async () => {
    renderWithRouterAndRedux(
      <TrainerRoleCard subjectId={TEST_BRIGHT_ID} />,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('role-card-score')).toHaveTextContent(
        compactFormat(trainerRole.score),
      );

      expect(screen.getByTestId('role-card-level')).toHaveTextContent(
        `lvl ${trainerRole.level}`,
      );
    });
  });

  it('Should hide the requirement when clicked', async () => {
    renderWithRouterAndRedux(
      <TrainerRoleCard subjectId={TEST_BRIGHT_ID} />,
      {},
    );
    await waitFor(() => {
      expect(screen.getByTestId('trainer-role-hide-btn')).toBeInTheDocument();
    });

    await act(() => {
      userEvent.click(screen.getByTestId('trainer-role-hide-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('trainer-role-show-btn')).toBeInTheDocument();
    });
  });
});

describe('Trainer role requirements', () => {
  const evaluations = Array.from({ length: 10 }).map(() =>
    generateEvaluationImpact(
      generateRandomBrightId(),
      Math.random() * 300 * 10 ** 6,
    ),
  );

  const trainerRole = {
    name: 'manager',
    level: 1,
    impacts: evaluations,
    score: evaluations.reduce((prev, curr) => prev + curr.score, 0),
  };

  const playerRole = {
    name: 'player',
    level: 0,
    impacts: [],
    score: 5000000,
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
              categories: [
                trainerRole,
                generateRoleData('subject'),
                playerRole,
              ],
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

  it('Should not show the show/hide button if the role is not achived', async () => {
    renderWithRouterAndRedux(
      <TrainerRoleCard subjectId={TEST_BRIGHT_ID} />,
      {},
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId('trainer-role-hide-btn'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('trainer-role-show-btn'),
      ).not.toBeInTheDocument();
    });
  });

  it('Should show the requirements to achive the role if not achived', async () => {
    renderWithRouterAndRedux(
      <TrainerRoleCard subjectId={TEST_BRIGHT_ID} />,
      {},
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('trainer-levelup-requirement'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('trainer-levelup-requirement'),
      ).toHaveTextContent('Reach Player level 2 to unlock');
    });
  });
});
