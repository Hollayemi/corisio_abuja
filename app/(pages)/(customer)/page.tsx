import Hero from "@/app/components/Sections/Hero";
import Categories from "@/app/components/ui/Categories";
import { DealOfTheDay, FreshProducts, MainFeatures, PromoBanners, ShopMore } from "@/app/components/Sections";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <Categories />
      <PromoBanners />
      <DealOfTheDay />
      <FreshProducts />
      <MainFeatures />
      <ShopMore />
    </div>
  );
}
