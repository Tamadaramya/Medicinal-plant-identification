import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/landing/LandingPage';
import IdentificationTab from './components/IdentificationTab';
import RecommenderTab from './components/RecommenderTab';
import HerbariumTab from './components/HerbariumTab';
import AcademicDashboardTab from './components/AcademicDashboardTab';
import MapAvailabilityTab from './components/MapAvailabilityTab';
import PlantModal from './components/PlantModal';
import './landing.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [gpuDevice, setGpuDevice] = useState(null);
  const [activeEngine, setActiveEngine] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.device) setGpuDevice(data.device);
        if (data.active_engine) setActiveEngine(data.active_engine);
      })
      .catch((err) => console.warn('Health check error:', err));
  }, []);

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Premium Glass Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabSwitch}
        gpuDevice={gpuDevice}
        activeEngine={activeEngine}
      />

      {/* Sub-Header Breadcrumb / Quick Switcher when not on Home */}
      {activeTab !== 'home' && (
        <div className="module-subnav-bar">
          <button
            className="module-back-home-btn"
            onClick={() => handleTabSwitch('home')}
          >
            <span>← Back to Home</span>
          </button>
          <div className="module-tabs-list">
            <button
              className={`module-tab-chip ${activeTab === 'identify' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('identify')}
            >
              <span>🔍</span> Identification & XAI
            </button>
            <button
              className={`module-tab-chip ${activeTab === 'recommender' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('recommender')}
            >
              <span>💊</span> Recommender
            </button>
            <button
              className={`module-tab-chip ${activeTab === 'herbarium' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('herbarium')}
            >
              <span>📖</span> Herbarium
            </button>
            <button
              className={`module-tab-chip ${activeTab === 'academic' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('academic')}
            >
              <span>📊</span> Evaluation
            </button>
            <button
              className={`module-tab-chip ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('map')}
            >
              <span>⌖</span> India Map
            </button>
          </div>
        </div>
      )}

      {/* Active Tab Panel */}
      <main className="main-content-wrapper">
        {activeTab === 'home' && (
          <LandingPage
            onNavigate={handleTabSwitch}
            onSelectPlant={(id) => setSelectedPlantId(id)}
          />
        )}
        {activeTab === 'identify' && <IdentificationTab />}
        {activeTab === 'recommender' && (
          <RecommenderTab onSelectPlant={(id) => setSelectedPlantId(id)} />
        )}
        {activeTab === 'herbarium' && (
          <HerbariumTab onSelectPlant={(id) => setSelectedPlantId(id)} />
        )}
        {activeTab === 'academic' && <AcademicDashboardTab />}
        {activeTab === 'map' && <MapAvailabilityTab />}
      </main>

      {/* Detailed Botanical Monograph Modal Drawer */}
      {selectedPlantId && (
        <PlantModal
          plantId={selectedPlantId}
          onClose={() => setSelectedPlantId(null)}
        />
      )}
    </div>
  );
}
