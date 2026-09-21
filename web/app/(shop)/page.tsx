import { OfferBar } from "@/components/shop/OfferBar";
import { Hero } from "@/components/shop/Hero";
import { ProvidersGrid } from "@/components/shop/ProvidersGrid";
import { Trust } from "@/components/shop/Trust";
import { Steps } from "@/components/shop/Steps";
import { Reviews } from "@/components/shop/Reviews";
import { FinalCta } from "@/components/shop/FinalCta";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Home() {
  const settings = await getSiteSettings();
  return (
    <>
      <OfferBar text={settings.offerbar_text} />
      <Hero headline={settings.hero_headline} />
      <ProvidersGrid />
      <Trust />
      <Steps />
      <Reviews />
      <FinalCta />
    </>
  );
}
