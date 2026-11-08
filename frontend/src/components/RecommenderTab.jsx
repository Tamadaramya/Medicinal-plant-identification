import React, { useState } from 'react';

export default function RecommenderTab({ onSelectPlant }) {
  const [query, setQuery] = useState('');
  const [part, setPart] = useState('');
  const [system, setSystem] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('');
  const [searchError, setSearchError] = useState('');

  const chips = [
    { label: '🌿 Cough & Cold', text: 'cough and cold' },
    { label: '🩸 Diabetes & Sugar', text: 'diabetes blood sugar' },
    { label: '🦴 Joint Pain & Arthritis', text: 'joint pain arthritis' },
    { label: '🧠 Stress & Insomnia', text: 'stress anxiety insomnia' },
    { label: '🫀 Heart & BP', text: 'high blood pressure hypertension' },
    { label: '🛡️ Immunity & Rejuvenative', text: 'rejuvenative strength immunity' },
    { label: '🩹 Skin & Eczema', text: 'skin diseases acne eczema' },
    { label: '🫄 Digestion & Acidity', text: 'indigestion acid reflux diarrhea' },
    { label: '🫘 Kidney & Urinary', text: 'kidney stones urinary burning' },
  ];

  const handleSearch = async (overrideQuery = null) => {
    const q = overrideQuery !== null ? overrideQuery : query;
    if (!q && !part && !system) return;

    setLoading(true);
    setHasSearched(true);
    setSearchError('');

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          part: part || null,
          system: system || null,
          max_results: 8,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Recommendation search failed.');
      setRecommendations(data.recommendations || []);
      setSearchMode(data.search_mode || 'local_fallback');
    } catch (err) {
      console.error('Recommender failed:', err);
      setSearchError(err.message || 'Recommendation search failed.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (text) => {
    setQuery(text);
    handleSearch(text);
  };

  return (
    <div className="recommender-container">
      <div className="recommender-hero">
        <h2>Ayurvedic Disease & Symptom Recommender</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '640px', margin: '0 auto' }}>
          Enter symptoms, therapeutic actions, or ailments to discover matched Indian medicinal plants cross-referenced with the authentic <strong>IMPR-100 Pharmacopoeia</strong>.
        </p>
      </div>

      {/* Search Input */}
      <div className="search-box-wrapper">
        <span className="search-icon-abs">🔎</span>
        <input
          type="text"
          className="search-input"
          placeholder="Type symptoms or actions e.g. 'cough asthma', 'arthritis joint pain', 'rejuvenative strength', 'skin diseases'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Quick Chips */}
      <div className="quick-chips-wrapper">
        <p className="chips-title">Frequent Ailments & Classical Categories</p>
        <div className="symptom-chips">
          {chips.map((chip, i) => (
            <button
              key={i}
              className={`chip-btn ${query === chip.text ? 'active' : ''}`}
              onClick={() => handleChipClick(chip.text)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          className="herb-filter-select"
          value={part}
          onChange={(e) => { setPart(e.target.value); }}
        >
          <option value="">All Plant Parts</option>
          <option value="leaf">Leaves</option>
          <option value="root">Roots / Rhizomes</option>
          <option value="bark">Stem Bark</option>
          <option value="fruit">Fruit / Seeds</option>
          <option value="flower">Flowers</option>
          <option value="whole plant">Whole Plant</option>
        </select>

        <select
          className="herb-filter-select"
          value={system}
          onChange={(e) => { setSystem(e.target.value); }}
        >
          <option value="">All Body Systems</option>
          <option value="respiratory">Respiratory</option>
          <option value="musculoskeletal">Musculoskeletal</option>
          <option value="digestive">Digestive</option>
          <option value="nervous">Nervous System</option>
          <option value="cardiovascular">Cardiovascular</option>
          <option value="integumentary">Integumentary (Skin)</option>
          <option value="urinary">Urinary / Renal</option>
          <option value="endocrine">Endocrine / Metabolism</option>
        </select>

        <button
          className="btn-primary"
          style={{ marginTop: 0, width: '140px', padding: '0 16px' }}
          onClick={() => handleSearch()}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results Grid */}
      {searchError && <div className="glass-card map-error" role="alert">{searchError}</div>}
      {!loading && hasSearched && !searchError && searchMode === 'local_fallback' && (
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
          Pinecone needs an API key, index host, and namespace; showing local matches until all three are configured.
        </p>
      )}
      {recommendations.length > 0 ? (
        <div className="rec-results-grid">
          {recommendations.map((plant) => {
            const commonName = plant.common_names?.english || plant.common_name_en || '';
            const sanskritName = plant.sanskrit_name || plant.common_names?.sanskrit || '';
            const isHot = (plant.potency || '').toLowerCase().includes('hot');

            return (
              <div key={plant.plant_id} className="rec-card">
                <div className="rec-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 className="rec-botanical">{plant.botanical_name}</h3>
                      {plant.habit && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                          🌿 {plant.habit}
                        </span>
                      )}
                      {plant.potency && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: isHot ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: isHot ? '#f87171' : '#60a5fa' }}>
                          {isHot ? '🔥 Hot' : '❄️ Cold'}
                        </span>
                      )}
                    </div>
                    <p className="rec-common" style={{ marginTop: '4px' }}>
                      <strong style={{ color: 'var(--accent-emerald-light)' }}>{sanskritName}</strong>
                      {commonName ? ` (${commonName})` : ''} • <span style={{ color: 'var(--text-muted)' }}>{plant.family || ''}</span>
                    </p>
                  </div>
                  <span className="match-score-badge">{plant.relevance_score}% Match</span>
                </div>

                <div className="rec-rationale-box">
                  {(plant.match_rationale || []).map((r, idx) => (
                    <span key={idx} className="rationale-tag">{r}</span>
                  ))}
                </div>

                <p className="rec-body-text">{plant.medicinal_summary || ''}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0', fontSize: '12px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Parts Used:</strong>{' '}
                    <span style={{ color: 'var(--accent-emerald-light)' }}>
                      {(plant.parts_used || []).join(', ')}
                    </span>
                  </div>
                  {plant.dosage && (
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Dosage:</strong>{' '}
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>{plant.dosage}</span>
                    </div>
                  )}
                </div>

                {plant.therapeutic_indications && plant.therapeutic_indications.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Classical Indications:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {plant.therapeutic_indications.slice(0, 4).map((ind, idx) => (
                        <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                          ✓ {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {plant.precautions && (
                  <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '2px solid var(--accent-amber)', fontSize: '11px', color: '#fde68a', borderRadius: '4px', marginTop: '6px' }}>
                    ⚠️ <strong>Precaution:</strong> {plant.precautions}
                  </div>
                )}

                {plant.recommendation_context && (() => {
                  const context = plant.recommendation_context;
                  const safety = context.safety || {};
                  const dosage = context.dosage || {};
                  const matching = context.symptom_matching || {};
                  const ageSafety = context.age_safety || {};
                  const availability = context.availability || {};
                  const review = context.review || {};
                  return (
                    <details className="recommendation-context">
                      <summary>Evidence, preparation &amp; safety details</summary>
                      {context.traditional_use?.claim_limitations && <p className="context-note">{context.traditional_use.claim_limitations}</p>}
                      {context.preparation?.length > 0 && <section>
                        <h4>Preparation notes</h4>
                        {context.preparation.map((item) => <div className="context-item" key={item.preparation_type}>
                          <strong>{item.plain_language}</strong><span>{item.use_guidance}</span>
                          {item.medicinal_dose_verified === false && <small>Medicinal dose not verified for this preparation.</small>}
                        </div>)}
                      </section>}
                      {dosage.instruction && <section>
                        <h4>Dose status: {dosage.status?.replaceAll('_', ' ') || 'not verified'}</h4>
                        <p className="context-note">{dosage.instruction}</p>
                      </section>}
                      {Object.keys(ageSafety).length > 0 && <section>
                        <h4>Age and life-stage guidance</h4>
                        <div className="context-list">{Object.entries(ageSafety).map(([group, guidance]) =>
                          <div key={group}><strong>{group.replaceAll('_', ' ')}</strong><span>{guidance.medicinal_use?.replaceAll('_', ' ') || 'Not specified'}</span></div>
                        )}</div>
                      </section>}
                      {matching.excluded_inferences?.length > 0 && <section>
                        <h4>Limits of symptom matching</h4>
                        <ul>{matching.excluded_inferences.map((item) => <li key={item}>{item}</li>)}</ul>
                      </section>}
                      {safety.high_risk_groups?.length > 0 && <section>
                        <h4>Groups needing extra review</h4>
                        <ul>{safety.high_risk_groups.map((item) => <li key={item}>{item}</li>)}</ul>
                      </section>}
                      {safety.emergency_symptoms?.length > 0 && <section className="context-warning">
                        <h4>Warning signs</h4>
                        <ul>{safety.emergency_symptoms.map((item) => <li key={item}>{item}</li>)}</ul>
                        {safety.emergency_action && <p>{safety.emergency_action}</p>}
                      </section>}
                      {availability.note && <section>
                        <h4>Availability ({availability.country || 'local'})</h4>
                        <p className="context-note">{availability.note} Status: {availability.availability_status?.replaceAll('_', ' ') || 'not specified'}.</p>
                      </section>}
                      {(context.sources?.length > 0 || review.content_status) && <section>
                        <h4>Sources &amp; review status</h4>
                        {context.sources?.map((source) => <p className="context-source" key={source.url || source.source_name}>
                          {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.source_name}</a> : source.source_name}
                          {source.supports_specific_ginger_claim === false && <span> — general context; does not support the specific plant claim.</span>}
                        </p>)}
                        <p className="context-note">Record: {review.content_status?.replaceAll('_', ' ') || 'status unavailable'}.
                          {' '}Scientific review: {review.scientific_reviewed ? 'complete' : 'pending'};
                          {' '}clinical review: {review.clinical_reviewed ? 'complete' : 'pending'};
                          {' '}safety review: {review.safety_reviewed ? 'complete' : 'pending'}.
                        </p>
                      </section>}
                    </details>
                  );
                })()}

                <div style={{ marginTop: '14px', textAlign: 'right' }}>
                  <button className="sample-pill-btn" onClick={() => onSelectPlant(plant.plant_id)}>
                    View Full Monograph →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : hasSearched ? (
        <div className="empty-state" style={{ height: '240px' }}>
          <div className="empty-state-icon">🍃</div>
          <p>No matching medicinal plants found. Try broader symptoms like "cough", "fever", "arthritis", or "diabetes".</p>
        </div>
      ) : (
        <div className="empty-state" style={{ height: '280px' }}>
          <div className="empty-state-icon">🌱</div>
          <p>Search symptoms or click any quick ailment chip above to discover recommended herbal medicines.</p>
        </div>
      )}
    </div>
  );
}
