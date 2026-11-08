import React, { useState, useEffect } from 'react';

export default function Navbar({ activeTab, onSelectTab, gpuDevice, activeEngine }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'identify', label: 'Plant Identification' },
    { id: 'recommender', label: 'Symptom Recommender' },
    { id: 'herbarium', label: 'Plant Herbarium' },
    { id: 'academic', label: 'Model Evaluation' },
    { id: 'map', label: 'Plant Distribution' },
  ];

  const handleNavClick = (tabId) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`app-header-glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div
          className="brand-section-clickable"
          onClick={() => handleNavClick('home')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-logo-glow">
            <svg
              className="brand-logo-leaf"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
            >
              <path
                d="M16 2 C22 7, 29 14, 27 24 C25 30, 19 31, 16 32 C13 31, 7 30, 5 24 C3 14, 10 7, 16 2 Z"
                fill="url(#navLeafGrad)"
                stroke="#34d399"
                strokeWidth="1.5"
              />
              <path d="M16 4 Q16 18, 16 30" stroke="#a7f3d0" strokeWidth="1.5" />
              <defs>
                <linearGradient id="navLeafGrad" x1="5" y1="2" x2="27" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#065f46" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-titles">
            <h1 className="brand-title">Medicinal Plant AI & XAI Hub</h1>
            <p className="brand-subtitle">
              Deep Learning • Grad-CAM XAI • Ayurvedic Pharmacopoeia
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span>{item.label}</span>
              {activeTab === item.id && <span className="nav-active-pill"></span>}
            </button>
          ))}
        </nav>

        {/* Right Status Indicator */}
        <div className="navbar-right-status">
          <div className="status-pill-subtle">
            <span className="status-live-dot"></span>
            <span className="status-pill-text">
              {activeEngine ? 'ViT Vision Engine' : (gpuDevice ? `${gpuDevice}` : 'AI Online')}
            </span>
          </div>
          <div className="status-pill-badge">
            <span>93 Species</span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-drawer-content">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.label}</span>
                {activeTab === item.id && <span className="mobile-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
