import { http, HttpResponse } from 'msw';
import {
  TEST_AUTH_KEY,
  TEST_BRIGHT_ID,
  TEST_BRIGHT_PASSWORD,
} from '../utils/api/profile';
import { setupServer } from 'msw/node';
import { renderWithRouterAndRedux } from '../utils/app';
import BrightIdProfilePicture from '@/components/BrightIdProfilePicture';
import { screen, waitFor } from '@testing-library/react';
import { encryptData } from '@/utils/crypto';

describe('Subject Image when the image is found', () => {
  const server = setupServer(
    http.get(`/brightid/backups/${TEST_AUTH_KEY}/*`, () =>
      HttpResponse.text(
        encryptData(
          'data:image/png;base64, TEST_BRIGHTID',
          TEST_BRIGHT_PASSWORD,
        ),
      ),
    ),
  );

  server.events.on('unhandledException', (args) => {
    console.log('Unexpected request');
    console.log(args);
  });

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('Should show the image', async () => {
    renderWithRouterAndRedux(
      <BrightIdProfilePicture subjectId={TEST_BRIGHT_ID} />,
      {},
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`picture-${TEST_BRIGHT_ID}`),
      ).toBeInTheDocument();

      expect(screen.getByTestId(`picture-${TEST_BRIGHT_ID}`)).toHaveAttribute(
        'src',
        'data:image/png;base64, TEST_BRIGHTID',
      );
    });
  });
});

describe('Subject image when the image is not found', async () => {
  it('Should create blockies image', async () => {
    renderWithRouterAndRedux(
      <BrightIdProfilePicture subjectId={'test-bright'} withoutHover />,
      {},
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`picture-test-bright-blocky`),
      ).toBeInTheDocument();
    });
  });
});
