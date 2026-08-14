/** @file `/` — the public landing page. Statically rendered; no auth, no data fetching. */

import ClosingCta from "./components/landing/ClosingCta";
import Hero from "./components/landing/Hero";
import LandingFooter from "./components/landing/LandingFooter";
import LandingNav from "./components/landing/LandingNav";
import Manifesto from "./components/landing/Manifesto";
import ProductBands from "./components/landing/ProductBands";

/**
 * Landing-page description, overriding the generic one in the root layout.
 * Title is inherited; only the description is specialised for search results.
 */
export const metadata = {
  description:
    "PrepTalk runs mock interviews as live rooms with video, a shared code workspace, and a scorecard the interviewer fills in — plus timed coding screens graded on the server.",
};

/**
 * Public landing page: hero, manifesto, product bands, closing CTA.
 * A server component with no data access, so it prerenders as static HTML.
 * Signed-in visitors are *not* redirected here — the middleware only bounces
 * them away from `/login` and `/register`, so the landing page stays reachable.
 * Uses `LandingNav` rather than the app `Navbar`, which returns null on `/`.
 * @returns {JSX.Element} The landing page.
 */
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
