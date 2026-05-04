import { resetAllStores } from '@/store/resetAllStores';
import { RoutePath } from '@/types/router';
import { useNavigate } from 'react-router';

export default function LogoutButton() {
  const navigate = useNavigate();

  return (
    <a-card
      variant="glass"
      className="cursor-pointer rounded-lg py-3.5 pl-5 pr-2"
      onClick={() => {
        resetAllStores();
        navigate(RoutePath.LOGIN);
      }}
      data-testid="logout-button"
    >
      <p className="text-[20px] font-medium">Logout</p>
    </a-card>
  );
}
