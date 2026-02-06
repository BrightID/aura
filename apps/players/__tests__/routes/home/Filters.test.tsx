import { BrightIdBackupConnection } from '@/types';
import { setupServer } from 'msw/node';
import {
  addPlayerRuleWithCategoryToConnection,
  createSubjectCategory,
  generateEvaluationImpact,
  generateRandomBrightIdConnectionBackup,
  TEST_BRIGHT_ID,
} from '../../utils/api/profile';
import {
  profileInterceptor,
  backupInterceptor,
  makeMockOutboundInterceptor,
  inboundEmptyInterceptor,
} from '../../utils/api/server';
import { renderWithRouterAndRedux } from '../../utils/app';
import HomePage from '@/app/routes/_app.home/route';
import { RefreshEvaluationsContextProvider } from '@/contexts/RefreshEvaluationsContext';
import { SubjectsListContextProvider } from '@/contexts/SubjectsListContext';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvaluationCategory, EvaluationValue } from '@/types/dashboard';

const mockedOutboundData = {
  data: { connections: [] as BrightIdBackupConnection[] },
};

const connection1 = generateRandomBrightIdConnectionBackup(
  'already known',
  'just met',
);
connection1.auraEvaluations?.push({
  domain: 'BrightID',
  category: EvaluationCategory.SUBJECT,
  confidence: 4,
  evaluation: EvaluationValue.POSITIVE,
  modified: new Date().getTime() / 1000,
  timestamp: new Date().getTime() / 1000,
});

const domains = connection1.verifications![0].domains!;

domains[0].categories.push(
  createSubjectCategory(
    EvaluationCategory.PLAYER,
    [
      generateEvaluationImpact(
        TEST_BRIGHT_ID,
        Math.floor(Math.random() * 100000),
        4,
        Math.floor(Math.random() * 100000),
      ),
    ],
    1,
  ),
);
addPlayerRuleWithCategoryToConnection(
  connection1,
  EvaluationCategory.SUBJECT,
  [
    generateEvaluationImpact(
      TEST_BRIGHT_ID,
      Math.floor(Math.random() * 100000),
      4,
      Math.floor(Math.random() * 100000),
    ),
  ],
  1,
);

const connection2 = generateRandomBrightIdConnectionBackup(
  'recovery',
  'recovery',
);

addPlayerRuleWithCategoryToConnection(
  connection2,
  EvaluationCategory.SUBJECT,
  [
    generateEvaluationImpact(
      TEST_BRIGHT_ID,
      Math.floor(Math.random() * 100000),
      4,
      Math.floor(Math.random() * 100000),
    ),
  ],
  2,
);

connection2.timestamp = new Date().getTime() + 400000;

const connection3 = generateRandomBrightIdConnectionBackup(
  'just met',
  'already known',
);

addPlayerRuleWithCategoryToConnection(
  connection3,
  EvaluationCategory.SUBJECT,
  [],
  0,
);

const connection4 = generateRandomBrightIdConnectionBackup(
  'recovery',
  'just met',
);
addPlayerRuleWithCategoryToConnection(
  connection4,
  EvaluationCategory.SUBJECT,
  [],
  4,
);

const connection5 = generateRandomBrightIdConnectionBackup(
  'recovery',
  'suspicious',
);

connection5.auraEvaluations?.push({
  domain: 'BrightID',
  category: EvaluationCategory.SUBJECT,
  confidence: 4,
  evaluation: EvaluationValue.NEGATIVE,
  modified: new Date().getTime() / 1000,
  timestamp: new Date().getTime() / 1000 - -2000,
});

addPlayerRuleWithCategoryToConnection(
  connection5,
  EvaluationCategory.SUBJECT,
  [],
  -1,
);

mockedOutboundData.data.connections.push(
  connection1,
  connection2,
  connection3,
  connection4,
  connection5,
);

const outboundData = mockedOutboundData;

const restListeners = [
  profileInterceptor,
  backupInterceptor,
  inboundEmptyInterceptor,
  makeMockOutboundInterceptor(outboundData),
];

const server = setupServer(...restListeners);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Filter basic bahvior', () => {
  it('Sort by Recent connections', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    await act(() => {
      userEvent.click(screen.getByTestId('dropdown-option-0'));
    });

    await waitFor(() => {
      outboundData.data.connections.forEach((connection) => {
        expect(
          screen.getByTestId(`subject-card-${connection.id}`),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByTestId(`subject-card-${connection2.id}-${0}`),
      ).toBeInTheDocument();
    });
  });

  it('Sort by recently evaluated connections', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    await act(() => {
      userEvent.click(screen.getByTestId('dropdown-option-2'));
    });

    await waitFor(() => {
      outboundData.data.connections.forEach((connection) => {
        expect(
          screen.getByTestId(`subject-card-${connection.id}`),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByTestId(`subject-card-${connection1.id}-${0}`),
      ).toBeInTheDocument();
    });
  });

  it('Should remember the sort state when refreshing or reloading the page', async () => {
    localStorage.setItem('subjectsListIsSortReversed', 'false');
    localStorage.setItem('subjectsListSortId', '4');

    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    await act(() => {
      userEvent.click(screen.getByTestId('dropdown-option-2'));
    });

    await waitFor(() => {
      outboundData.data.connections.forEach((connection) => {
        expect(
          screen.getByTestId(`subject-card-${connection.id}`),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByTestId(`subject-card-${connection1.id}-${0}`),
      ).toBeInTheDocument();
    });
  });
});

describe('Custom Filter Behavior', () => {
  it('Should Open when clicking custom view', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    await act(() => {
      userEvent.click(screen.getByTestId('dropdown-option--1'));
    });

    expect(screen.getByTestId('custom-view-title')).toHaveTextContent(
      'Custom View',
    );
  });

  it('Should Reset the view when clicking the clear button', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    await act(() => {
      userEvent.click(screen.getByTestId('dropdown-option--1'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('custom-view-title')).toBeInTheDocument();
      expect(screen.getByTestId('custom-view-title')).toHaveTextContent(
        'Custom View',
      );
    });
  });

  it('Should Close the modal when clicking okay', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    await act(() => {
      userEvent.click(screen.getByTestId('dropdown-option--1'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('custom-view-clear-button'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('custom-view-ok-button')).toBeInTheDocument();
    });

    await act(() => {
      userEvent.click(screen.getByTestId('custom-view-ok-button'));
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId('custom-view-ok-button'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('custom-view-title')).not.toBeInTheDocument();
    });
  });

  it('Should filter by level 1', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {},
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-view-select')).toBeInTheDocument();

      userEvent.click(screen.getByTestId('home-view-select'));
    });

    act(() => {
      userEvent.click(screen.getByTestId('dropdown-option--1'));
    });

    act(() => {
      userEvent.click(screen.getByTestId('subject-filter-option-Level0'));
      // userEvent.click(screen.getByTestId('subject-filter-option-Level0'));
    });
    act(() => {
      userEvent.click(screen.getByTestId('custom-view-ok-button'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`subject-card-${connection3.id}-${0}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(`subject-card-${connection5.id}`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`subject-card-${connection4.id}`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`subject-card-${connection2.id}`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`subject-card-${connection1.id}`),
      ).not.toBeInTheDocument();
    });
  });

  it('Should filter by connection type ');

  it('Should sort by last connected, ASC/DESC');

  it('Should sort by confidence, ASC/DESC');

  it('Should sort by Score, ASC/DESC');
  it('Should sort by Recently evaluated, ASC/DESC');

  it('Should sort by combination of score and confidence');
});
