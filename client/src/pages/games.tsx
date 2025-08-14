import { SiteLayout } from "@/components/SiteLayout";
import { GamesHeader } from "@/components/games/games-header";
import { GameCategories } from "@/components/games/game-categories";
import { ClassicBingo } from "@/components/games/classic-bingo";
import { SpeedBingo } from "@/components/games/speed-bingo";
import { ThemedBingo } from "@/components/games/themed-bingo";
import { GameBenefits } from "@/components/games/game-benefits";
import { GamesCTA } from "@/components/games/games-cta";
import { GamesFAQ } from "@/components/games/games-faq";

export default function Games() {
  return (
    <SiteLayout>
      <GamesHeader />
      <GameCategories />
      <ClassicBingo />
      <SpeedBingo />
      <ThemedBingo />
      <GameBenefits />
      <GamesCTA />
      <GamesFAQ />
    </SiteLayout>
  );
}