import { Chrome, Reveal } from "@/components/live";
import { Hero, Ticker } from "@/components/sections/Hero";
import { Arena, Days, Faq, FinalCall, Footer, Prizes, Register, Stage, Trust, Value, Venue } from "@/components/sections/Sections";

export default function Home() {
  return (
    <>
      <Chrome />
      <main>
        <Hero />
        <Ticker />
        <Arena />
        <Prizes />
        <Value />
        <Stage />
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
