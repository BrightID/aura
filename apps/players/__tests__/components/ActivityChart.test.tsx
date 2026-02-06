import { ActivityChart } from '@/components/Shared/ActivitiesCard/activity-chart';
import { renderWithRouterAndRedux } from '../utils/app';
import { EvaluationCategory } from '@/types/dashboard';
import {
  generateMockedProfile,
  generateRandomBrightId,
  generateRoleData,
  mockedBrightIdProfileData,
  TEST_BRIGHT_ID,
} from '../utils/api/profile';
import { screen, waitFor } from '@testing-library/react';
import { Verifications } from '@/api/auranode.service';
import { generateOutboundEvaluationConnection } from '../utils/api/outbounds';

describe('Activity Chart Render', () => {
  it('Should render the activity chart', async () => {
    renderWithRouterAndRedux(
      <ActivityChart
        evaluationCategory={EvaluationCategory.PLAYER}
        ratings={[]}
        loading={false}
        subjectId={TEST_BRIGHT_ID}
      />,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('activity-chart-container'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    });
  });

  it('Should show the skeleton loading when loading is true', async () => {
    renderWithRouterAndRedux(
      <ActivityChart
        evaluationCategory={EvaluationCategory.PLAYER}
        ratings={[]}
        loading
        subjectId={TEST_BRIGHT_ID}
      />,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId('chart-loading-skeleton')).toBeInTheDocument();
    });
  });

  it('Chart should represent the correct data', async () => {
    const randomBrightIds = Array.from({ length: 5 }).map(() =>
      generateMockedProfile(generateRandomBrightId(), [
        generateRoleData('subject', 5, 3),
        generateRoleData('player', 5, 3),
      ]),
    );

    renderWithRouterAndRedux(
      <ActivityChart
        evaluationCategory={EvaluationCategory.PLAYER}
        ratings={randomBrightIds.map((item, key) => ({
          category: EvaluationCategory.PLAYER,
          createdAt: new Date().toISOString(),
          fromBrightId: TEST_BRIGHT_ID,
          isPending: false,
          rating: '4',
          timestamp: new Date().getTime(),
          toBrightId: item.id,
          updatedAt: new Date().toISOString(),
          id: -1,
          verifications: item.verifications as Verifications,
        }))}
        loading={false}
        subjectId={TEST_BRIGHT_ID}
        profile={{
          ...mockedBrightIdProfileData.data,
          connectedAt: new Date().getTime(),
          verifications: mockedBrightIdProfileData.data
            .verifications as Verification[],
        }}
        outboundEvaluations={randomBrightIds.map((item) =>
          generateOutboundEvaluationConnection(
            mockedBrightIdProfileData.data,
            item as { id: string; verifications: Verifications },
            EvaluationCategory.PLAYER,
            3000,
            4,
          ),
        )}
      />,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    // await waitFor(() => {
    //   for (const subject of randomBrightIds) {
    //     expect(
    //       screen.getByTestId(`activity-chart-bar-cell-${subject.id}`),
    //     ).toBeInTheDocument();
    //   }
    // });
  });

  it('Chart Zoom in / Zoom out buttons should work', async () => {});

  it('Chart Panning left and right', async () => {});

  it('Chart Reset button', async () => {});
});
