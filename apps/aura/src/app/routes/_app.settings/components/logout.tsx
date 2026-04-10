import { resetStore } from '@/BrightID/actions';
import { useDispatch } from '@/store/hooks';
import { RoutePath } from '@/types/router';
import { useNavigate } from 'react-router';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <a-card
      className="cursor-pointer rounded-lg py-3.5 pl-5 pr-2"
      onClick={() => {
        dispatch(resetStore());
        navigate(RoutePath.LOGIN);
      }}
      data-testid="logout-button"
    >
      <p className="text-[20px] font-medium">Logout</p>
    </a-card>
  );
}
