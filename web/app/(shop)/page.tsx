import { OfferBar } from "@/components/shop/OfferBar";
import { Hero } from "@/components/shop/Hero";
import { Showcase } from "@/components/shop/Showcase";
import { ProvidersGrid } from "@/components/shop/ProvidersGrid";
import { Trust } from "@/components/shop/Trust";
import { Steps } from "@/components/shop/Steps";
import { Reviews } from "@/components/shop/Reviews";
import { FinalCta } from "@/components/shop/FinalCta";

export default function Home() {
  return (
    <>
      <OfferBar text="¡Oferta especial solo hoy! Acceso al proveedor con descuento. Termina en:" />
      <Hero />
      <Showcase />
      <ProvidersGrid />
      <Trust />
      <Steps />
      <Reviews />
      <FinalCta />
    </>
  );
}
