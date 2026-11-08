import React, { useState, useEffect, useRef } from 'react';

function useCountUp(endValue, duration = 1800, shouldStart = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    let startTime = null;
    let animId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * endValue));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [endValue, duration, shouldStart]);

  return count;
}

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const countClasses = useCountUp(93, 1600, isVisible);
  const countImages = useCountUp(33128, 2000, isVisible);
  const countTrain = useCountUp(20253, 2000, isVisible);
  const countAcc = useCountUp(86, 1600, isVisible);
  const countKB = useCountUp(80, 1600, isVisible);

  return (
    <section ref={sectionRef} className="stats-section">
      <div className="stats-container">
        <div className="stats-grid">
          {/* Card 1: Classes */}
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span>🌿</span>
            </div>
            <div className="stat-number">
              {isVisible ? countClasses : 0}
            </div>
            <div className="stat-title">Botanical Species</div>
            <div className="stat-desc">Indian medicinal taxa scanned and cataloged</div>
          </div>

          {/* Card 2: Total Images */}
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span>📸</span>
            </div>
            <div className="stat-number">
              {isVisible ? countImages.toLocaleString() : '0'}
            </div>
            <div className="stat-title">Curated Specimen Images</div>
            <div className="stat-desc">Multi-angle leaf & whole-plant authentic captures</div>
          </div>

          {/* Card 3: Training Split */}
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span>🎯</span>
            </div>
            <div className="stat-number">
              {isVisible ? countTrain.toLocaleString() : '0'}
            </div>
            <div className="stat-title">Stratified Training Set</div>
            <div className="stat-desc">70% split with fixed random seed (42)</div>
          </div>

          {/* Card 4: Top-5 Accuracy */}
          <div className="stat-card highlight">
            <div className="stat-icon-wrapper">
              <span>⚡</span>
            </div>
            <div className="stat-number">
              {isVisible ? `${countAcc}.0%` : '0%'}
            </div>
            <div className="stat-title">Top-5 Model Accuracy</div>
            <div className="stat-desc">Verified benchmark on held-out test splits</div>
          </div>

          {/* Card 5: Knowledge Base */}
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span>📜</span>
            </div>
            <div className="stat-number">
              {isVisible ? `${countKB}+` : '0'}
            </div>
            <div className="stat-title">Ayurvedic Monographs</div>
            <div className="stat-desc">Phytochemicals, doshas, and formulations</div>
          </div>
        </div>
      </div>
    </section>
  );
}

