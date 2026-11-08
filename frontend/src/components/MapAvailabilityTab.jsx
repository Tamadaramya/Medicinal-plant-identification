import React, { useEffect, useMemo, useState } from 'react';

const MAP_WIDTH = 720;
const MAP_HEIGHT = 720;
const MAP_PADDING = 18;

const STATE_ABBREVIATIONS = {
  'Andaman and Nicobar Islands': 'A&N',
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  Assam: 'AS',
  Bihar: 'BR',
  Chandigarh: 'CH',
  Chhattisgarh: 'CG',
  'Dadra and Nagar Haveli and Daman and Diu': 'DNH',
  Delhi: 'DL',
  Goa: 'GA',
  Gujarat: 'GJ',
  Haryana: 'HR',
  'Himachal Pradesh': 'HP',
  'Jammu and Kashmir': 'J&K',
  Jharkhand: 'JH',
  Karnataka: 'KA',
  Kerala: 'KL',
  Ladakh: 'LA',
  Lakshadweep: 'LD',
  'Madhya Pradesh': 'MP',
  Maharashtra: 'MH',
  Manipur: 'MN',
  Meghalaya: 'ML',
  Mizoram: 'MZ',
  Nagaland: 'NL',
  Odisha: 'OD',
  Puducherry: 'PY',
  Punjab: 'PB',
  Rajasthan: 'RJ',
  Sikkim: 'SK',
  'Tamil Nadu': 'TN',
  Telangana: 'TS',
  Tripura: 'TR',
  'Uttar Pradesh': 'UP',
  Uttarakhand: 'UK',
  'West Bengal': 'WB',
};

const AVAILABILITY_COLORS = {
  'Highly available': '#16a875',
  'Moderately available': '#73ba57',
  'Less available': '#e7ae4d',
  Unknown: '#718096',
  'No record': '#263a35',
};

function normalizeName(value = '') {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
}

function stateAvailability(plant, stateName) {
  if (!plant || !stateName) return 'No record';
  const availability = plant.availability || {};
  const state = normalizeName(stateName);
  for (const level of ['Highly available', 'Moderately available', 'Less available']) {
    const states = availability[level] || [];
    if (states.some((name) => normalizeName(name) === state)) return level;
  }
  const unknown = availability.Unknown || availability.unknown || [];
  if (unknown.some((name) => {
    const normalized = normalizeName(name);
    return normalized === state || normalized.startsWith('all states') || normalized.includes('all states pending');
  })) return 'Unknown';
  return 'No record';
}

function polygonsFor(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

async function readJsonResponse(response, sourceName) {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${sourceName} request failed (${response.status}).`);
  }
  try {
    return JSON.parse(body);
  } catch {
    const looksLikeHtml = /^\s*<!doctype\s+html|^\s*<html/i.test(body);
    if (looksLikeHtml && sourceName === 'Plant availability API') {
      throw new Error('The backend returned its web page instead of map data. Stop and restart Flask so it registers the new /api/map route.');
    }
    if (looksLikeHtml) {
      throw new Error('The India map file returned an HTML page instead of GeoJSON. Restart the Vite frontend and check frontend/public/india-states.geojson.');
    }
    throw new Error(`${sourceName} returned invalid JSON.`);
  }
}

function buildStatePaths(features) {
  if (!features?.length) return [];

  const points = [];
  features.forEach((feature) => polygonsFor(feature.geometry).forEach((polygon) => {
    polygon.forEach((ring) => ring.forEach(([lon, lat]) => {
      if (Number.isFinite(lon) && Number.isFinite(lat)) points.push([lon, lat]);
    }));
  }));
  if (!points.length) return [];

  const longitudeScale = Math.cos((22 * Math.PI) / 180);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  points.forEach(([lon, lat]) => {
    const x = lon * longitudeScale;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, lat);
    maxY = Math.max(maxY, lat);
  });
  const scale = Math.min(
    (MAP_WIDTH - MAP_PADDING * 2) / (maxX - minX),
    (MAP_HEIGHT - MAP_PADDING * 2) / (maxY - minY),
  );
  const drawnWidth = (maxX - minX) * scale;
  const drawnHeight = (maxY - minY) * scale;
  const offsetX = (MAP_WIDTH - drawnWidth) / 2;
  const offsetY = (MAP_HEIGHT - drawnHeight) / 2;
  const project = ([lon, lat]) => [
    offsetX + (lon * longitudeScale - minX) * scale,
    offsetY + (maxY - lat) * scale,
  ];

  const states = new Map();
  features.forEach((feature) => {
    const name = feature.properties?.st_nm || feature.properties?.name;
    if (!name) return;
    let state = states.get(name);
    if (!state) {
      state = { name, paths: [], minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      states.set(name, state);
    }
    polygonsFor(feature.geometry).forEach((polygon) => {
      polygon.forEach((ring) => {
        if (ring.length < 4) return;
        const mapped = ring.map(project);
        mapped.forEach(([x, y]) => {
          state.minX = Math.min(state.minX, x);
          state.minY = Math.min(state.minY, y);
          state.maxX = Math.max(state.maxX, x);
          state.maxY = Math.max(state.maxY, y);
        });
        state.paths.push(`${mapped.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')}Z`);
      });
    });
  });

  return Array.from(states.values()).map((state) => ({
    ...state,
    path: state.paths.join(''),
    labelX: (state.minX + state.maxX) / 2,
    labelY: (state.minY + state.maxY) / 2,
  }));
}

export default function MapAvailabilityTab() {
  const [mapData, setMapData] = useState(null);
  const [geoFeatures, setGeoFeatures] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [hoveredState, setHoveredState] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/map').then((response) => readJsonResponse(response, 'Plant availability API')),
      fetch('/india-states.geojson').then((response) => readJsonResponse(response, 'India map file')),
    ]).then(([data, geojson]) => {
      if (!active) return;
      setMapData(data);
      setGeoFeatures(geojson.features || []);
    }).catch((loadError) => {
      if (active) setError(loadError.message);
    });
    return () => { active = false; };
  }, []);

  const states = useMemo(() => buildStatePaths(geoFeatures), [geoFeatures]);
  const plants = mapData?.plants || [];
  const filteredPlants = search.trim()
    ? plants.filter((plant) => normalizeName(`${plant.plant_name} ${plant.scientific_name || ''}`).includes(normalizeName(search))).slice(0, 8)
    : [];
  const activeState = hoveredState;
  const activeAvailability = stateAvailability(selectedPlant, activeState);

  const choosePlant = (plant) => {
    setSelectedPlant(plant);
    setSearch(plant?.plant_name || '');
    setHoveredState('');
  };

  const chooseSearch = (value) => {
    setSearch(value);
    const exactMatch = plants.find((plant) =>
      normalizeName(plant.plant_name) === normalizeName(value)
      || (plant.scientific_name && normalizeName(plant.scientific_name) === normalizeName(value))
    );
    setSelectedPlant(exactMatch || null);
    setHoveredState('');
  };

  if (error) return <div className="glass-card map-error">{error}</div>;

  return (
    <section className="map-tab">
      <div className="glass-card map-intro-card">
        <div>
          <p className="map-eyebrow">FIELD GUIDE · 80 PLANTS · 36 STATES & UTs</p>
          <h2 className="map-heading">Where medicinal plants grow across India</h2>
          <p className="map-intro-copy">Search for a plant to shade states by its recorded availability. Hover over a state to see its season and field notes.</p>
        </div>
        <div className="map-plant-search">
          <label htmlFor="map-plant-search">Search a plant</label>
          <input
            id="map-plant-search"
            type="search"
            value={search}
            onChange={(event) => chooseSearch(event.target.value)}
            placeholder="Try Neem, Tulsi, Aloe vera…"
            autoComplete="off"
          />
          {filteredPlants.length > 0 && !selectedPlant && (
            <div className="map-search-suggestions">
              {filteredPlants.map((plant) => (
                <button type="button" key={plant.plant_name} onClick={() => choosePlant(plant)}>
                  <span>{plant.plant_name}</span>
                  {plant.scientific_name && <small>{plant.scientific_name}</small>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="map-workspace">
        <div className="glass-card india-map-card">
          <div className="map-card-heading">
            <div>
              <span className="map-eyebrow">INDIA · STATE AVAILABILITY</span>
              <h3>{selectedPlant ? selectedPlant.plant_name : 'Select a plant to explore'}</h3>
            </div>
            {selectedPlant?.scientific_name && <em>{selectedPlant.scientific_name}</em>}
          </div>

          <div className="india-map-canvas" aria-label="Clickable map of Indian states and union territories">
            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="India plant availability map">
              <defs>
                <filter id="selected-state-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {states.map((state) => {
                const availability = stateAvailability(selectedPlant, state.name);
                const selected = activeState === state.name;
                return (
                  <g key={state.name} className="map-state-group" onMouseEnter={() => setHoveredState(state.name)} onMouseLeave={() => setHoveredState('')}>
                    <title>{`${state.name} · ${availability}`}</title>
                    <path
                      d={state.path}
                      fill={AVAILABILITY_COLORS[availability]}
                      className={selected ? 'map-state-shape selected' : 'map-state-shape'}
                      filter={selected ? 'url(#selected-state-glow)' : undefined}
                      role="button"
                      tabIndex="0"
                      aria-label={`${state.name}: ${availability}`}
                      onFocus={() => setHoveredState(state.name)}
                      onBlur={() => setHoveredState('')}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setHoveredState(state.name);
                        }
                      }}
                    />
                    <text x={state.labelX} y={state.labelY} className="map-state-label" pointerEvents="none">
                      {STATE_ABBREVIATIONS[state.name] || state.name.slice(0, 2).toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
            {selectedPlant && activeState && (
              <div className="map-hover-card" role="status">
                <span className="map-eyebrow">PLANT IN THIS REGION</span>
                <h3>{activeState}</h3>
                <div className="map-availability-badge" style={{ '--availability-color': AVAILABILITY_COLORS[activeAvailability] }}>
                  <i />{activeAvailability}
                </div>
                {activeAvailability === 'Unknown' && <p className="map-detail-copy">The source data does not establish a reliable state-level availability estimate for this plant.</p>}
                {activeAvailability === 'No record' && <p className="map-detail-copy">No state-level availability record is listed for this plant.</p>}
                {selectedPlant.season_notes && <p className="map-detail-copy">{selectedPlant.season_notes}</p>}
                {selectedPlant.seasonality && (
                  <div className="map-season-list">
                    {Object.entries(selectedPlant.seasonality).filter(([, value]) => Array.isArray(value) && value.length).map(([season, values]) => (
                      <div key={season}><span>{season.replaceAll('_', ' ')}</span><strong>{values.join(' · ')}</strong></div>
                    ))}
                    {typeof selectedPlant.seasonality.year_round_presence === 'boolean' && (
                      <div><span>Year-round presence</span><strong>{selectedPlant.seasonality.year_round_presence ? 'Reported' : 'Not reported'}</strong></div>
                    )}
                  </div>
                )}
              </div>
            )}
            {!states.length && <div className="map-loading">Loading India map…</div>}
          </div>

          <div className="map-legend" aria-label="Availability legend">
            {Object.entries(AVAILABILITY_COLORS).map(([label, color]) => (
              <span key={label}><i style={{ backgroundColor: color }} />{label}</span>
            ))}
          </div>
          <p className="map-data-note">
            Availability is indicative and may vary by habitat, season, cultivation, and local verification. State boundaries: <a href="https://github.com/iamaanahmad/GeoJson-of-Indian-States" target="_blank" rel="noreferrer">GeoJSON of Indian States</a>.
          </p>
        </div>

      </div>
    </section>
  );
}
