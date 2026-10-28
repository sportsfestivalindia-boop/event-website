import { BullIntro } from "@/components/BullIntro";
import { Chrome, Reveal } from "@/components/live";
import { Glance, Hero } from "@/components/sections/Hero";
import { Championships } from "@/components/Championships";
import { SportsIcons } from "@/components/SportsIcons";
import { Arena, Champions, Days, Faq, FinalCall, Footer, Prizes, Register, Trust, Value, Venue } from "@/components/sections/Sections";

export default function Home() {
  return (
    <>
      <BullIntro />
      <Chrome />
      <main>
        <Hero />
        <SportsIcons />
        <Glance />
        <Championships />
        <Arena />
        <Prizes />
        <Champions />
        <Value />
        <Days />
        <Trust />
        <Register />
        <Venue />
        <Faq />
        <FinalCall />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
