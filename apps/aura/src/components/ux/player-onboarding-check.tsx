import { useProfileStore } from "@/store/profile.store";
import { useNavigate } from "react-router";

export default function PlayerOnboardingCheck() {
  const playerOnboardingScreenShown = useProfileStore(
    (s) => s.playerOnboardingScreenShown,
  );

  const navigate = useNavigate()

  if (!playerOnboardingScreenShown) navigate("/onboard")

  return null
}