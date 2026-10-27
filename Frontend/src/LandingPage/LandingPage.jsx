import Navbar from "../Navbar/Navbar";

import Hero from "./Hero/Hero";
import TrustedStats from "./TrustedStat/TrustedStat";
import HowItWorks from "./HowItWorks/HowItWorks";
import ResourceCoordination from "./ResourceCoordination/ResourceCoordination";
import ConflictDetection from "./ConflictDetection/ConflictDetection";
import DashboardPreview from "./DashboardPreview/DashboardPreview";
import Features from "./Features/Features";
import CTA from "./CTA/CTA";
import Footer from "./Footer/Footer";

import Pricing from "../Pricing/Pricing";

import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        <Hero />
        <TrustedStats />
        <HowItWorks />
        <ResourceCoordination />
        <ConflictDetection />
        <DashboardPreview />
        <Features />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;