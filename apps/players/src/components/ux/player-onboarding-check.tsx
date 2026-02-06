import { selectPlayerOnboardingScreenShown } from "@/store/profile/selectors";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";



export default function PlayerOnboardingCheck() {
  const playerOnboardingScreenShown = useSelector(
    selectPlayerOnboardingScreenShown,
  );

  const navigate = useNavigate()


  if (!playerOnboardingScreenShown) navigate("/onboard")


  return null
}