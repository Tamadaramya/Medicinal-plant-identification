import React from 'react';
import HeroVisual3D from './HeroVisual3D';

export default function HeroSection({ onNavigate }) {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Side: Editorial & CTAs */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span className="hero-badge-text">AI POWERED BOTANICAL DISCOVERY</span>
          </div>

          <h1 className="hero-title">
            Discover the Hidden Intelligence of{' '}
            <span className="hero-title-gradient">Indian Medicinal Plants</span>
          </h1>

          <p className="hero-subtitle">
            Where Ancient Botanical Knowledge Meets Artificial Intelligence.
          </p>

          <p className="hero-description">
            Identify Indian medicinal plants using deep learning, explore their traditional medicinal
            properties, understand AI predictions through Explainable AI and discover geographical plant
            distribution.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button
              className="hero-btn-primary"
              onClick={() => onNavigate('identify')}
            >
              <span>Explore Plant Identification</span>
              <svg className="btn-arrow-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => onNavigate('herbarium')}
            >
              <span>Explore Medicinal Knowledge</span>
              <svg className="btn-book-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span><strong>93</strong> Botanical Taxa</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span><strong>Grad-CAM</strong> XAI Heatmaps</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span><strong>70%</strong> Confidence Gate</span>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Botanical Visual */}
        <div className="hero-visual-wrapper">
          <HeroVisual3D />
        </div>
      </div>
    </section>
  );
}

