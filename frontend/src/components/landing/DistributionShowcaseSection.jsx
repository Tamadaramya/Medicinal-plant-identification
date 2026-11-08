import React from 'react';

export default function DistributionShowcaseSection({ onNavigate }) {
  const hotspots = [
    {
      region: 'Western Ghats',
      states: 'Kerala, Karnataka, Maharashtra, Goa, Tamil Nadu',
      species: 'Brahmi, Ashoka, Red Sanders, Malabar Nut',
      desc: 'UNESCO World Heritage biodiversity hotspot with moist evergreen flora.',
      icon: '🌊',
      color: '#10b981',
    },
    {
      region: 'Himalayan Sub-Alpine',
      states: 'Himachal Pradesh, Uttarakhand, J&K, Sikkim',
      species: 'Vatsanabha (Aconitum), Katuka, Jatamansi, Deodar',
      desc: 'High-altitude cold alpine herbs endowed with potent volatile oils.',
      icon: '🏔️',
      color: '#34d399',
    },
    {
      region: 'Deccan & Central Plains',
      states: 'Madhya Pradesh, Andhra Pradesh, Telangana, Chhattisgarh',
      species: 'Arjuna, Bael, Guggulu, Shatavari, Kalmegh',
      desc: 'Dry deciduous forests and tropical scrublands rich in hardy adaptogens.',
      icon: '☀️',
      color: '#6ee7b7',
    },
    {
      region: 'Northeast Rainforests',
      states: 'Assam, Meghalaya, Arunachal Pradesh, Tripura',
      species: 'Agaru, Black Cardamom, Blue Glory, Cinnamon',
      desc: 'Sub-tropical wet rainforests harboring rare aromatic medicinal barks.',
      icon: '🌧️',
      color: '#14b8a6',
    },
  ];

  return (
    <section className="distribution-showcase-section">
      <div className="section-header">
        <div className="section-badge">GEOSPATIAL BIODIVERSITY</div>
        <h2 className="section-title">Explore India's Medicinal Plant Diversity</h2>
        <p className="section-subtitle">
          Discover geographical plant distribution records across Indian states, connecting botanical
          habitats, regional availability ratings, and optimal seasonal harvesting cycles.
        </p>
      </div>

      <div className="distribution-showcase-container">
        {/* Left Side: India Map Visual Presentation */}
        <div className="distribution-map-card">
          <div className="map-badge-overlay">
            <span className="pulse-indicator"></span>
            <span>28 States & UTs Mapped</span>
          </div>

          <div className="map-illustration-box">
            <svg
              className="india-stylized-map-svg"
              viewBox="0 0 450 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0.3" />
                </linearGradient>
                <filter id="mapGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Stylized geometric India silhouette */}
              <path
                d="M175 45 L 210 30 L 250 55 L 260 85 L 240 115 L 280 130 L 320 120 L 370 125 L 410 140 L 420 170 L 380 190 L 330 180 L 290 200 L 310 240 L 300 280 L 280 320 L 250 360 L 220 420 L 210 460 L 200 420 L 170 350 L 140 280 L 120 250 L 90 240 L 80 200 L 110 170 L 120 130 L 150 90 Z"
                fill="url(#mapGradient)"
                stroke="#34d399"
                strokeWidth="2"
                strokeDasharray="4 2"
                filter="url(#mapGlow)"
              />

              {/* State boundary decorative mesh */}
              <line x1="175" y1="45" x2="240" y2="115" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />
              <line x1="240" y1="115" x2="290" y2="200" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />
              <line x1="150" y1="90" x2="120" y2="250" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />
              <line x1="120" y1="250" x2="250" y2="360" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />
              <line x1="290" y1="200" x2="250" y2="360" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />
              <line x1="290" y1="200" x2="380" y2="190" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />

              {/* Hotspot Pulsing Rings */}
              {/* Western Ghats */}
              <g className="map-hotspot-pin" transform="translate(160, 360)">
                <circle cx="0" cy="0" r="14" fill="rgba(16, 185, 129, 0.25)" className="pin-pulse" />
                <circle cx="0" cy="0" r="6" fill="#10b981" />
                <text x="12" y="4" fill="#a7f3d0" fontSize="11" fontWeight="600">Western Ghats</text>
              </g>

              {/* Himalayan Belt */}
              <g className="map-hotspot-pin" transform="translate(200, 75)">
                <circle cx="0" cy="0" r="14" fill="rgba(52, 211, 153, 0.25)" className="pin-pulse" />
                <circle cx="0" cy="0" r="6" fill="#34d399" />
                <text x="12" y="4" fill="#a7f3d0" fontSize="11" fontWeight="600">Himalayan Belt</text>
              </g>

              {/* Central Plains */}
              <g className="map-hotspot-pin" transform="translate(210, 230)">
                <circle cx="0" cy="0" r="14" fill="rgba(110, 231, 183, 0.25)" className="pin-pulse" />
                <circle cx="0" cy="0" r="6" fill="#6ee7b7" />
                <text x="12" y="4" fill="#a7f3d0" fontSize="11" fontWeight="600">Central Plateau</text>
              </g>

              {/* Northeast */}
              <g className="map-hotspot-pin" transform="translate(360, 160)">
                <circle cx="0" cy="0" r="14" fill="rgba(20, 184, 166, 0.25)" className="pin-pulse" />
                <circle cx="0" cy="0" r="6" fill="#14b8a6" />
                <text x="12" y="4" fill="#a7f3d0" fontSize="11" fontWeight="600">Northeast</text>
              </g>
            </svg>
          </div>

          <div className="map-card-footer">
            <div className="map-legend">
              <span className="legend-chip"><span className="legend-dot green"></span> Highly Available</span>
              <span className="legend-chip"><span className="legend-dot lime"></span> Moderately Available</span>
              <span className="legend-chip"><span className="legend-dot yellow"></span> Less Available</span>
            </div>
            <button
              className="map-open-btn"
              onClick={() => onNavigate('map')}
            >
              <span>Open Interactive India Map</span>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side: Biodiversity Hotspot Cards */}
        <div className="hotspots-list">
          {hotspots.map((item, idx) => (
            <div key={idx} className="hotspot-card">
              <div className="hotspot-header">
                <span className="hotspot-icon">{item.icon}</span>
                <div>
                  <h4 className="hotspot-name">{item.region}</h4>
                  <div className="hotspot-states">{item.states}</div>
                </div>
              </div>
              <p className="hotspot-desc">{item.desc}</p>
              <div className="hotspot-species">
                <strong>Flagship Species:</strong> {item.species}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

