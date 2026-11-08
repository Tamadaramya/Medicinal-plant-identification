import React, { useState } from 'react';

export default function XAIShowcaseSection({ onNavigate }) {
  const [blendOpacity, setBlendOpacity] = useState(65);
  const [viewMode, setViewMode] = useState('trio'); // 'trio' or 'blend'

  return (
    <section className="xai-showcase-section">
      <div className="section-header">
        <div className="section-badge">EXPLAINABLE ARTIFICIAL INTELLIGENCE</div>
        <h2 className="section-title">See How Artificial Intelligence Understands Plants</h2>
        <p className="section-subtitle">
          Go beyond predictions. Visualize the morphological image regions—such as leaf venation,
          serrations, and apical contours—that drove the model's classification using Grad-CAM.
        </p>
      </div>

      {/* Mode Controls */}
      <div className="xai-controls-bar">
        <div className="xai-segmented-toggle">
          <button
            className={`seg-toggle-btn ${viewMode === 'trio' ? 'active' : ''}`}
            onClick={() => setViewMode('trio')}
          >
            <span>Trio Attribution View</span>
          </button>
          <button
            className={`seg-toggle-btn ${viewMode === 'blend' ? 'active' : ''}`}
            onClick={() => setViewMode('blend')}
          >
            <span>Live Interactive Blend</span>
          </button>
        </div>

        {viewMode === 'blend' && (
          <div className="xai-live-slider-box">
            <span className="slider-label">Heatmap Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={blendOpacity}
              onChange={(e) => setBlendOpacity(Number(e.target.value))}
              className="xai-blend-slider"
            />
            <span className="slider-val">{blendOpacity}%</span>
          </div>
        )}
      </div>

      {/* Showcase Visual Display */}
      {viewMode === 'trio' ? (
        <div className="xai-trio-grid">
          {/* Panel 1: Original */}
          <div className="xai-panel-card">
            <div className="xai-panel-badge">01 • Input Specimen</div>
            <div className="xai-panel-media">
              <img
                src="/showcase/original.jpg"
                alt="Input Specimen"
                className="xai-panel-img"
              />
            </div>
            <div className="xai-panel-footer">
              <h4 className="xai-panel-title">Ocimum sanctum (Tulsi)</h4>
              <p className="xai-panel-desc">Authentic test image specimen before gradient backpropagation.</p>
            </div>
          </div>

          {/* Panel 2: Heatmap */}
          <div className="xai-panel-card">
            <div className="xai-panel-badge jet">02 • Grad-CAM Heatmap</div>
            <div className="xai-panel-media">
              <img
                src="/showcase/heatmap.jpg"
                alt="Grad-CAM Jet Heatmap"
                className="xai-panel-img"
              />
            </div>
            <div className="xai-panel-footer">
              <h4 className="xai-panel-title">Gradient Activation Map</h4>
              <p className="xai-panel-desc">Jet color-mapped activations showing pooled feature intensity.</p>
            </div>
          </div>

          {/* Panel 3: Overlay */}
          <div className="xai-panel-card highlight">
            <div className="xai-panel-badge overlay">03 • Blended Attribution</div>
            <div className="xai-panel-media">
              <img
                src="/showcase/overlay.jpg"
                alt="Blended Attribution Overlay"
                className="xai-panel-img"
              />
            </div>
            <div className="xai-panel-footer">
              <h4 className="xai-panel-title">Morphological Attribution</h4>
              <p className="xai-panel-desc">Alpha-blended composite highlighting leaf venation drivers.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="xai-blend-interactive-wrapper">
          <div className="xai-blend-stage">
            <img
              src="/showcase/original.jpg"
              alt="Base Specimen"
              className="blend-img-base"
            />
            <img
              src="/showcase/heatmap.jpg"
              alt="Heatmap Layer"
              className="blend-img-overlay"
              style={{ opacity: blendOpacity / 100 }}
            />
            <div className="blend-indicator-badge">
              <span>Interactive Layering: {blendOpacity}% Heatmap</span>
            </div>
          </div>
        </div>
      )}

      {/* Scientific Explanations Row */}
      <div className="xai-insights-grid">
        <div className="xai-insight-card">
          <div className="insight-icon">🔍</div>
          <h4 className="insight-title">Eliminating Black-Box Opacity</h4>
          <p className="insight-text">
            Conventional deep neural networks output class labels without diagnostic evidence.
            Grad-CAM extracts spatial heatmaps directly from the final layer to prove the model is
            inspecting authentic leaf anatomy rather than background soil, pots, or lighting artifacts.
          </p>
        </div>

        <div className="xai-insight-card">
          <div className="insight-icon">📐</div>
          <h4 className="insight-title">Mathematical Rigor</h4>
          <p className="insight-text">
            Backpropagated gradients quantify importance weights:
            <code className="math-code"> α_k^c = (1/Z) ∑∑ (∂y^c / ∂A^k)</code>.
            Linear combinations of positive forward activations highlight distinct botanical traits
            like serrate leaf margins and reticulate venation.
          </p>
        </div>

        <div className="xai-insight-card">
          <div className="insight-icon">🛡️</div>
          <h4 className="insight-title">Clinical Decision Safety</h4>
          <p className="insight-text">
            Coupled with a strict 70% confidence threshold and toxic plant lookalike screening,
            visual explanations enable botanists and researchers to verify classifications before
            clinical Ayurvedic application.
          </p>
        </div>
      </div>

      <div className="xai-cta-row">
        <button
          className="xai-live-btn"
          onClick={() => onNavigate('identify')}
        >
          <span>Run Grad-CAM on Your Own Plant Image</span>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </section>
  );
}

