import { Chrome, Reveal } from "@/components/live";
import { Glance, Hero, Ticker } from "@/components/sections/Hero";
import { Arena, Champions, Days, Faq, FinalCall, Footer, Prizes, Register, Trust, Value, Venue } from "@/components/sections/Sections";

export default function Home() {
  return (
    <>
      <Chrome />
      <main>
        <Hero />
        <Ticker />
        <Glance />
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
