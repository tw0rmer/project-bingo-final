import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { GameLobby } from "@/components/game-lobby";
import { HowToPlay } from "@/components/how-to-play";
import { RecentWinners } from "@/components/recent-winners";
import { FaqSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>
        <HeroSection />
        <GameLobby />
        <HowToPlay />
        <RecentWinners />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
