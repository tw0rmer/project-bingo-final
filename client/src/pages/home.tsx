import { SiteLayout } from "@/components/SiteLayout";
import { HeroSection } from "@/components/hero-section";
import { GameLobby } from "@/components/game-lobby";
import { HowToPlay } from "@/components/how-to-play";
import { RecentWinners } from "@/components/recent-winners";
import { FaqSection } from "@/components/faq-section";

export default function Home() {
  return (
    <SiteLayout>
      <HeroSection />
      <GameLobby />
      <HowToPlay />
      <RecentWinners />
      <FaqSection />
    </SiteLayout>
  );
}
