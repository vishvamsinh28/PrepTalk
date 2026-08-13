import ClosingCta from "./components/landing/ClosingCta";
import Hero from "./components/landing/Hero";
import LandingFooter from "./components/landing/LandingFooter";
import LandingNav from "./components/landing/LandingNav";
import Manifesto from "./components/landing/Manifesto";
import ProductBands from "./components/landing/ProductBands";

export const metadata = {
  description:
    "PrepTalk runs mock interviews as live rooms with video, a shared code workspace, and a scorecard the interviewer fills in — plus timed coding screens graded on the server.",
};

export default function HomePage() {
  return (
    <div className="landing-page bg-canvas text-ink">
      <LandingNav />
      <main>
        <Hero />
        <Manifesto />
        <ProductBands />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
