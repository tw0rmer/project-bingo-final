import { SiteLayout } from "@/components/SiteLayout";
import { HowToPlayHeader } from "@/components/how-to-play/how-to-play-header";
import { MainSteps } from "@/components/how-to-play/main-steps";
import { SignUpProcess } from "@/components/how-to-play/sign-up-process";
import { DepositFunds } from "@/components/how-to-play/deposit-funds";
import { GameLobbyGuide } from "@/components/how-to-play/game-lobby-guide";
import { GameWorkflow } from "@/components/how-to-play/game-workflow";
import { HowToPlayCTA } from "@/components/how-to-play/how-to-play-cta";
import { HowToPlayFAQ } from "@/components/how-to-play/how-to-play-faq";

export default function HowToPlay() {
  return (
    <SiteLayout>
      <HowToPlayHeader />
      <MainSteps />
      <SignUpProcess />
      <DepositFunds />
      <GameLobbyGuide />
      <GameWorkflow />
      <HowToPlayCTA />
      <HowToPlayFAQ />
    </SiteLayout>
  );
}