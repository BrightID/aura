import ToggleTheme from '@/app/routes/_app.settings/components/theme-toggle';
import { renderWithRouterAndRedux } from '../../utils/app';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Toggle Theme', () => {
  it('Theme should be dark for default', async () => {
    renderWithRouterAndRedux(<ToggleTheme />, {
      router: {
        initialEntries: ['/settings'],
      },
    });

    expect(screen.getByTestId('toggle-theme-btn')).toBeInTheDocument();
  });

  it('Should change the theme when clicked', async () => {
    renderWithRouterAndRedux(<ToggleTheme />, {
      router: {
        initialEntries: ['/settings'],
      },
    });

    act(() => {
      userEvent.click(screen.getByTestId('toggle-theme-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-light')).toBeInTheDocument();
    });
  });

  it('Should read the theme from redux', async () => {
    renderWithRouterAndRedux(<ToggleTheme />, {
      router: {
        initialEntries: ['/settings'],
      },
      redux: {
        preloadedState: {
          settings: {
            prefferedTheme: 'light',
          } as any,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-light')).toBeInTheDocument();
    });
  });
});
