import { act, screen } from '@testing-library/react';
import { renderWithRouterAndRedux } from '../../utils/app';
import LogoutButton from '@/app/routes/_app.settings/components/logout';
import userEvent from '@testing-library/user-event';
import * as resetModule from '@/BrightID/actions';

describe('Logout button', () => {
  it('Should render the logout button', async () => {
    renderWithRouterAndRedux(<LogoutButton />, {
      router: {
        initialEntries: ['/settings'],
      },
    });

    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('Should logout when the button is pressed', async () => {
    const resetStoreSpy = vi.spyOn(resetModule, 'resetStore');

    renderWithRouterAndRedux(<LogoutButton />, {
      router: {
        initialEntries: ['/settings'],
      },
    });

    act(() => {
      userEvent.click(screen.getByTestId('logout-button'));
    });

    expect(resetStoreSpy).toHaveBeenCalledTimes(1);
  });
});
