import React from 'react';

export default function FeaturedPlantsSection({ onNavigate, onSelectPlant }) {
  const featuredPlants = [
    {
      id: '12_Withania_somnifera',
      modalId: '12_Withania_somnifera',
      searchQuery: 'Ashwagandha',
      commonName: 'Ashwagandha',
      scientificName: 'Withania somnifera',
      sanskritName: 'Ashwagandha',
      family: 'Solanaceae',
      habit: 'Shrub (5ft)',
      partUsed: 'Root, Whole Plant',
      phytochemicals: 'Withanolides, Somniferine, Withaferin A',
      therapeutic: 'Adaptogen, Stress Reduction, Neuroprotection, Vitality',
      image: '/plants/ashwagandha.jpg',
      dosha: 'Balances Vata & Kapha',
      potency: 'Ushna (Hot)',
    },
    {
      id: '95_Ocimum_sanctum',
      modalId: '75_Tulsi',
      searchQuery: 'Tulsi',
      commonName: 'Tulsi (Holy Basil)',
      scientificName: 'Ocimum sanctum',
      sanskritName: 'Tulasi',
      family: 'Lamiaceae',
      habit: 'Aromatic Shrub (3ft)',
      partUsed: 'Leaves, Seeds, Whole Plant',
      phytochemicals: 'Eugenol, Ursolic acid, Rosmarinic acid, Caryophyllene',
      therapeutic: 'Respiratory Health, Immunomodulation, Cough & Cold, Anti-microbial',
      image: '/plants/tulsi.jpg',
      dosha: 'Balances Kapha & Vata',
      potency: 'Ushna (Hot)',
    },
    {
      id: '50_Neem',
      modalId: '50_Neem',
      searchQuery: 'Neem',
      commonName: 'Neem',
      scientificName: 'Azadirachta indica',
      sanskritName: 'Nimba',
      family: 'Meliaceae',
      habit: 'Evergreen Tree (40ft)',
      partUsed: 'Leaves, Bark, Seed Oil',
      phytochemicals: 'Azadirachtin, Nimbin, Nimbidin, Quercetin',
      therapeutic: 'Skin Disorders, Blood Purification, Anti-fungal, Fever & Detox',
      image: '/plants/neem.jpg',
      dosha: 'Balances Pitta & Kapha',
      potency: 'Sheeta (Cold)',
    },
    {
      id: '38_Curcuma_longa',
      modalId: '76_Turmeric',
      searchQuery: 'Turmeric',
      commonName: 'Turmeric (Haldi)',
      scientificName: 'Curcuma longa',
      sanskritName: 'Haridra',
      family: 'Zingiberaceae',
      habit: 'Perennial Herb',
      partUsed: 'Rhizome',
      phytochemicals: 'Curcuminoids, Curcumin, Turmerone, Zingiberene',
      therapeutic: 'Potent Anti-inflammatory, Wound Healing, Joint Care, Antioxidant',
      image: '/plants/turmeric.jpg',
      dosha: 'Tridoshic (Balances Vata, Pitta, Kapha)',
      potency: 'Ushna (Hot)',
    },
    {
      id: '22_Bacopa_monnieri',
      modalId: '11_Bhrami',
      searchQuery: 'Brahmi',
      commonName: 'Brahmi',
      scientificName: 'Bacopa monnieri',
      sanskritName: 'Brahmi',
      family: 'Scrophulariaceae',
      habit: 'Succulent Creeper',
      partUsed: 'Whole Plant, Leaves',
      phytochemicals: 'Bacosides A & B, Brahmine, Herpestine',
      therapeutic: 'Cognitive Enhancement, Memory Booster, Anxiety Relief, Medhya Rasayana',
      image: '/plants/brahmi.jpg',
      dosha: 'Balances Vata & Pitta',
      potency: 'Sheeta (Cold)',
    },
    {
      id: '5_Emblica_officinalis',
      modalId: '2_Amla',
      searchQuery: 'Amla',
      commonName: 'Amla (Indian Gooseberry)',
      scientificName: 'Phyllanthus emblica',
      sanskritName: 'Amalaki',
      family: 'Euphorbiaceae',
      habit: 'Deciduous Tree (30ft)',
      partUsed: 'Fruit, Fresh Pulp',
      phytochemicals: 'Ascorbic acid (Vitamin C), Ellagic acid, Emblicanin',
      therapeutic: 'Digestive Fire, Immune Defense, Hair & Skin Health, Anti-aging Rasayana',
      image: '/plants/amla.jpg',
      dosha: 'Tridoshic (Calms all 3 Doshas)',
      potency: 'Sheeta (Cold)',
    },
  ];

  const handleExplore = (plant) => {
    if (onSelectPlant && plant.modalId) {
      onSelectPlant(plant.modalId);
    } else {
      onNavigate('herbarium');
    }
  };

  return (
    <section className="featured-plants-section">
      <div className="section-header">
        <div className="section-badge">BOTANICAL PHARMACOPOEIA</div>
        <h2 className="section-title">Featured Indian Medicinal Species</h2>
        <p className="section-subtitle">
          Classical therapeutic plants curated from the 93-species botanical repository, linking
          botanical taxonomy to active phytochemical constituents.
        </p>
      </div>

      <div className="featured-plants-grid">
        {featuredPlants.map((plant) => (
          <div key={plant.id} className="plant-feature-card">
            <div className="plant-feature-img-box">
              <img
                src={plant.image}
                alt={plant.commonName}
                className="plant-feature-img"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="plant-feature-badge-row">
                <span className="plant-family-badge">{plant.family}</span>
                <span className="plant-potency-badge">{plant.potency}</span>
              </div>
            </div>

            <div className="plant-feature-body">
              <div className="plant-names">
                <h3 className="plant-common-name">{plant.commonName}</h3>
                <div className="plant-scientific-name">
                  <em>{plant.scientificName}</em>
                  {plant.sanskritName && (
                    <span className="plant-sanskrit-tag"> • {plant.sanskritName}</span>
                  )}
                </div>
              </div>

              <p className="plant-therapeutic-desc">{plant.therapeutic}</p>

              <div className="plant-meta-tags">
                <div className="meta-tag">
                  <span className="meta-icon">🌱</span>
                  <span>Part: {plant.partUsed}</span>
                </div>
                <div className="meta-tag">
                  <span className="meta-icon">🧪</span>
                  <span>Active: {plant.phytochemicals.split(',')[0]}</span>
                </div>
                <div className="meta-tag">
                  <span className="meta-icon">⚖️</span>
                  <span>{plant.dosha}</span>
                </div>
              </div>

              <div className="plant-card-footer">
                <button
                  className="plant-explore-btn"
                  onClick={() => handleExplore(plant)}
                >
                  <span>Explore Monograph</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="featured-plants-bottom">
        <button
          className="view-all-herbarium-btn"
          onClick={() => onNavigate('herbarium')}
        >
          <span>Browse All 93 Species in the Herbarium</span>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </section>
  );
}

