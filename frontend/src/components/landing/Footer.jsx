import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="hub-footer">
      <div className="footer-glow-backdrop"></div>
      <div className="footer-container">
        {/* Brand & Mission Column */}
        <div className="footer-col-brand">
          <div className="footer-brand-header">
            <div className="footer-logo">🌿</div>
            <div>
              <h3 className="footer-brand-title">Medicinal Plant AI & XAI Hub</h3>
              <p className="footer-tagline">
                Combining deep learning, explainable AI and traditional medicinal plant knowledge.
              </p>
            </div>
          </div>
          <p className="footer-brand-desc">
            An academic research platform developed for identifying 93 Indian medicinal species with
            confidence-aware decision gates, transparent Grad-CAM gradient heatmaps, and structured
            Ayurvedic pharmacopoeia integration.
          </p>
          <div className="footer-tech-stack">
            <span className="tech-badge">React.js 18</span>
            <span className="tech-badge">Flask 3</span>
            <span className="tech-badge">PyTorch</span>
            <span className="tech-badge">HuggingFace ViT</span>
            <span className="tech-badge">Grad-CAM XAI</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col-nav">
          <h4 className="footer-heading">Platform Modules</h4>
          <ul className="footer-links">
            <li>
              <button className="footer-link-btn" onClick={() => onNavigate('home')}>
                <span>🏠</span> Home Overview
              </button>
            </li>
            <li>
              <button className="footer-link-btn" onClick={() => onNavigate('identify')}>
                <span>🔍</span> Plant Identification & XAI
              </button>
            </li>
            <li>
              <button className="footer-link-btn" onClick={() => onNavigate('recommender')}>
                <span>💊</span> Symptom & Disease Recommender
              </button>
            </li>
            <li>
              <button className="footer-link-btn" onClick={() => onNavigate('herbarium')}>
                <span>📖</span> 93-Species Herbarium
              </button>
            </li>
            <li>
              <button className="footer-link-btn" onClick={() => onNavigate('academic')}>
                <span>📊</span> Model Evaluation & Benchmark
              </button>
            </li>
            <li>
              <button className="footer-link-btn" onClick={() => onNavigate('map')}>
                <span>⌖</span> Indian Plant Distribution
              </button>
            </li>
          </ul>
        </div>

        {/* Scientific Research & Disclaimer Column */}
        <div className="footer-col-disclaimer">
          <h4 className="footer-heading">Research & Governance</h4>
          <div className="disclaimer-card">
            <div className="disclaimer-icon">⚖️</div>
            <div>
              <h5 className="disclaimer-title">Scientific & Educational Disclaimer</h5>
              <p className="disclaimer-text">
                This system is developed strictly for botanical identification research, machine learning
                explainability demonstration, and educational purposes. Traditional Ayurvedic
                indications are compiled from classical pharmacopoeias. Always consult certified
                botanists and medical professionals for clinical healthcare applications.
              </p>
            </div>
          </div>
          <div className="academic-badge-box">
            <span>B.Tech Capstone Project • Computer Science & Engineering</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <div className="copyright-text">
            © {new Date().getFullYear()} Medicinal Plant AI & XAI Hub. All rights reserved.
          </div>
          <div className="footer-status-pill">
            <span className="status-indicator-green"></span>
            <span>All 5 AI & Pharmacopoeia Engines Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

