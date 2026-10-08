import {
  BestSellers,
  Categories,
  DealOfTheDay,
  Hero,
  LandingCTA,
  NewOnCorisio,
  PopularNearYou,
  StoresNearYou,
  TrendingNow,
} from "@/app/components/Sections";

/**
 * Landing page order:
 * Hero (with search) → Categories → Deals of the Day → Popular Near You →
 * Stores Near You → Best Sellers → New on Corisio → Trending Now → CTA
 */
export default function Home() {
  return (
    <div>
      <Hero />
      <Categories />
      <DealOfTheDay />
      <PopularNearYou />
      <StoresNearYou />
      <BestSellers />
      <NewOnCorisio />
      <TrendingNow />
      <LandingCTA />
    </div>
  );
}
