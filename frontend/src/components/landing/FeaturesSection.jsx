import React from 'react';

export default function FeaturesSection({ onNavigate }) {
  const features = [
    {
      id: 'identify',
      tag: 'Computer Vision',
      title: 'Plant Identification & XAI',
      description:
        'Upload a leaf or whole-plant image and identify medicinal plants using a deep learning CNN model.',
      highlights: [
        'Image Upload & Drag-and-Drop',
        'RGB Normalization Preprocessing',
        'Deep Vision Prediction',
        'Softmax Top-K Ranking',
        'Toxic Plant Safety Check',
        'Confidence Check (≥ 70%)',
        'Grad-CAM Heatmap & Overlay',
      ],
      btnText: 'Identify Plant',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <path d="M11 8v6M8 11h6"></path>
        </svg>
      ),
    },
    {
      id: 'recommender',
      tag: 'Ayurvedic Retrieval',
      title: 'Symptom & Disease Recommender',
      description:
        'Discover relevant Indian medicinal plants using symptom-based semantic knowledge retrieval.',
      highlights: [
        'Multi-Token Symptom Search',
        'Classical Disease Matching',
        'Relevance Score Ranking',
        'Medicinal Uses & Indications',
        'Ayurvedic Preparation Rationale',
        'Contraindication Warnings',
      ],
      btnText: 'Explore Recommendations',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      ),
    },
    {
      id: 'herbarium',
      tag: 'Pharmacopoeia Database',
      title: 'Medicinal Plant Herbarium',
      description:
        'Explore the medicinal properties and traditional botanical knowledge of Indian medicinal plants.',
      highlights: [
        'Botanical & Sanskrit Taxonomy',
        'Vernacular English & Regional Names',
        'Botanical Family & Habit',
        'Parts Used (Leaf, Bark, Root)',
        'Active Phytochemical Compounds',
        'Classical Dosha & Rasa Karma',
      ],
      btnText: 'Explore Herbarium',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          <path d="M12 6v6M9 9h6"></path>
        </svg>
      ),
    },
    {
      id: 'academic',
      tag: 'Scientific Validation',
      title: 'Model Evaluation & XAI',
      description:
        'Understand the performance and explainability of the trained deep learning model.',
      highlights: [
        '93-Class Confusion Matrix',
        'Loss & Accuracy Curves',
        'Top-1 & Top-5 Benchmark',
        'Weighted Precision, Recall & F1',
        'Classification Performance Audit',
        'Class Imbalance Stratification',
      ],
      btnText: 'View Evaluation',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      id: 'map',
      tag: 'Geospatial Distribution',
      title: 'Indian Plant Distribution',
      description:
        'Explore geographical distribution records of Indian medicinal plants through an interactive India map.',
      highlights: [
        'Interactive SVG India Map',
        '28 States & UTs Cataloged',
        'Availability Ratings per State',
        'Regional Biogeographic Zones',
        'Seasonal Harvesting Periods',
        'Plant-to-Region Filtering',
      ],
      btnText: 'Explore Distribution',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      ),
    },
  ];

  return (
    <section className="features-section">
      <div className="section-header">
        <div className="section-badge">CORE CAPABILITIES</div>
        <h2 className="section-title">Explore the Medicinal Plant Intelligence Ecosystem</h2>
        <p className="section-subtitle">
          Five cohesive scientific modules unifying computer vision, explainable artificial
          intelligence, and Ayurvedic pharmacopoeia.
        </p>
      </div>

      <div className="features-grid">
        {features.map((item) => (
          <div key={item.id} className="feature-card">
            <div className="feature-card-glow"></div>
            <div className="feature-card-top">
              <div className="feature-icon-badge">{item.icon}</div>
              <span className="feature-tag">{item.tag}</span>
            </div>

            <h3 className="feature-title">{item.title}</h3>
            <p className="feature-description">{item.description}</p>

            <div className="feature-highlights-list">
              {item.highlights.map((h, i) => (
                <div key={i} className="highlight-pill">
                  <span className="highlight-dot"></span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button
              className="feature-action-btn"
              onClick={() => onNavigate(item.id)}
            >
              <span>{item.btnText}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

