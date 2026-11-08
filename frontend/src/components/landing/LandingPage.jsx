import React, { useEffect } from 'react';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import WorkflowSection from './WorkflowSection';
import FeaturedPlantsSection from './FeaturedPlantsSection';
import XAIShowcaseSection from './XAIShowcaseSection';
import DistributionShowcaseSection from './DistributionShowcaseSection';
import Footer from './Footer';

export default function LandingPage({ onNavigate, onSelectPlant }) {
  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section with 3D Botanical Composition */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Verified Project Statistics Counters */}
      <StatsSection />

      {/* 3. Core Features Section (5 Interactive Cards) */}
      <FeaturesSection onNavigate={onNavigate} />

      {/* 4. AI Identification Pipeline Timeline (10 Stages) */}
      <WorkflowSection onNavigate={onNavigate} />

      {/* 5. Featured Medicinal Plants Gallery (6 Curated Species) */}
      <FeaturedPlantsSection onNavigate={onNavigate} onSelectPlant={onSelectPlant} />

      {/* 6. Explainable AI (XAI) Grad-CAM Showcase */}
      <XAIShowcaseSection onNavigate={onNavigate} />

      {/* 7. India Medicinal Plant Distribution Showcase */}
      <DistributionShowcaseSection onNavigate={onNavigate} />

      {/* 8. Professional Scientific Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

