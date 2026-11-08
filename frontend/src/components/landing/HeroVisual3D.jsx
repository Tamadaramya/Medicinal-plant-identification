import React, { useState, useEffect, useRef } from 'react';

export default function HeroVisual3D() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Living botanical spore particle network on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId = null;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle definition
    const count = 32;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 500),
        y: Math.random() * (canvas.height || 500),
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint interconnecting neural / bio-network threads
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.22;
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles with glowing halo
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(167, 243, 208, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-3d-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Bio-Network Canvas */}
      <canvas ref={canvasRef} className="hero-bio-canvas" />

      {/* Ambient background glow */}
      <div className="hero-glow-sphere primary"></div>
      <div className="hero-glow-sphere secondary"></div>

      {/* Parallax wrapper driven by mouse position */}
      <div
        className="hero-parallax-group"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
        }}
      >
        {/* Concentric Rotating Orbital Rings */}
        <div className="orbital-ring ring-outer"></div>
        <div className="orbital-ring ring-mid"></div>
        <div className="orbital-ring ring-inner"></div>

        {/* Floating Botanical Leaf Illustration with intricate glowing venation */}
        <div className="central-leaf-wrapper">
          <svg
            className="central-leaf-svg"
            viewBox="0 0 400 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="leafGrad" x1="50" y1="20" x2="350" y2="460" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="85%" stopColor="#065f46" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="veinGrad" x1="200" y1="40" x2="200" y2="440" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#34d399" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
              </linearGradient>

              <filter id="leafGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Leaf Outer Shadow/Backdrop */}
            <path
              d="M200 30 C 270 90, 360 180, 340 320 C 320 420, 240 450, 200 460 C 160 450, 80 420, 60 320 C 40 180, 130 90, 200 30 Z"
              fill="#062e22"
              opacity="0.6"
              transform="translate(8, 14)"
            />

            {/* Main Leaf Body */}
            <path
              d="M200 30 C 270 90, 360 180, 340 320 C 320 420, 240 450, 200 460 C 160 450, 80 420, 60 320 C 40 180, 130 90, 200 30 Z"
              fill="url(#leafGrad)"
              stroke="rgba(52, 211, 153, 0.45)"
              strokeWidth="2.5"
              className="leaf-body-path"
            />

            {/* Central Primary Vein (Midrib) */}
            <path
              d="M200 30 Q 198 240, 200 460"
              stroke="url(#veinGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#leafGlow)"
            />

            {/* Secondary Lateral Veins - Right Side */}
            <path d="M200 110 Q 250 135, 295 160" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
            <path d="M200 170 Q 270 200, 320 235" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
            <path d="M200 235 Q 280 270, 325 310" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.65" strokeLinecap="round" />
            <path d="M200 300 Q 270 340, 305 380" stroke="#a7f3d0" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
            <path d="M200 365 Q 250 400, 270 425" stroke="#a7f3d0" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />

            {/* Secondary Lateral Veins - Left Side */}
            <path d="M200 110 Q 150 135, 105 160" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
            <path d="M200 170 Q 130 200, 80 235" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
            <path d="M200 235 Q 120 270, 75 310" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.65" strokeLinecap="round" />
            <path d="M200 300 Q 130 340, 95 380" stroke="#a7f3d0" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
            <path d="M200 365 Q 150 400, 130 425" stroke="#a7f3d0" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />

            {/* Tertiary Reticulate Micro-vein network */}
            <path d="M230 125 Q 260 115, 275 140" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.45" />
            <path d="M245 185 Q 285 180, 300 205" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.45" />
            <path d="M240 255 Q 285 245, 305 275" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.4" />
            <path d="M170 125 Q 140 115, 125 140" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.45" />
            <path d="M155 185 Q 115 180, 100 205" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.45" />
            <path d="M160 255 Q 115 245, 95 275" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.4" />

            {/* Pulsing AI Feature Nodes on Key Venation Intersections */}
            <circle cx="200" cy="110" r="4" fill="#a7f3d0" className="ai-node-pulse" />
            <circle cx="200" cy="170" r="4" fill="#a7f3d0" className="ai-node-pulse" style={{ animationDelay: '0.4s' }} />
            <circle cx="200" cy="235" r="4" fill="#a7f3d0" className="ai-node-pulse" style={{ animationDelay: '0.8s' }} />
            <circle cx="200" cy="300" r="4" fill="#a7f3d0" className="ai-node-pulse" style={{ animationDelay: '1.2s' }} />
            <circle cx="270" cy="200" r="3.5" fill="#34d399" className="ai-node-pulse" style={{ animationDelay: '0.6s' }} />
            <circle cx="130" cy="200" r="3.5" fill="#34d399" className="ai-node-pulse" style={{ animationDelay: '1.0s' }} />
            <circle cx="280" cy="270" r="3.5" fill="#34d399" className="ai-node-pulse" style={{ animationDelay: '1.4s' }} />
            <circle cx="120" cy="270" r="3.5" fill="#34d399" className="ai-node-pulse" style={{ animationDelay: '1.6s' }} />
          </svg>
        </div>

        {/* Orbiting Satellite Leaflet 1 */}
        <div className="satellite-leaf leaflet-1">
          <svg viewBox="0 0 80 120" fill="none" width="46" height="68">
            <path
              d="M40 5 C 60 25, 75 55, 70 85 C 65 110, 48 118, 40 120 C 32 118, 15 110, 10 85 C 5 55, 20 25, 40 5 Z"
              fill="url(#leafGrad)"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            <path d="M40 5 Q 39 60, 40 120" stroke="#a7f3d0" strokeWidth="1.8" />
          </svg>
        </div>

        {/* Orbiting Satellite Leaflet 2 */}
        <div className="satellite-leaf leaflet-2">
          <svg viewBox="0 0 80 120" fill="none" width="38" height="56">
            <path
              d="M40 5 C 60 25, 75 55, 70 85 C 65 110, 48 118, 40 120 C 32 118, 15 110, 10 85 C 5 55, 20 25, 40 5 Z"
              fill="url(#leafGrad)"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            <path d="M40 5 Q 39 60, 40 120" stroke="#a7f3d0" strokeWidth="1.8" />
          </svg>
        </div>

        {/* Floating AI Telemetry Glass Cards */}
        {/* Card 1: Top Right */}
        <div
          className="hero-telemetry-badge telemetry-top-right"
          style={{ transform: `translate(${mousePos.x * -16}px, ${mousePos.y * -16}px)` }}
        >
          <div className="telemetry-icon-box">
            <span>🧠</span>
          </div>
          <div>
            <div className="telemetry-label">Deep Learning Vision</div>
            <div className="telemetry-value">ViT Backbone • 86.0% Top-5</div>
            <div className="telemetry-sub">52 Target Classes Active</div>
          </div>
          <div className="telemetry-status-dot online"></div>
        </div>

        {/* Card 2: Bottom Left */}
        <div
          className="hero-telemetry-badge telemetry-bottom-left"
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
        >
          <div className="telemetry-icon-box">
            <span>🔬</span>
          </div>
          <div>
            <div className="telemetry-label">Explainable AI (XAI)</div>
            <div className="telemetry-value">Grad-CAM Venation Map</div>
            <div className="telemetry-sub">features[-1] Gradient Pooling</div>
          </div>
        </div>

        {/* Card 3: Bottom Right */}
        <div
          className="hero-telemetry-badge telemetry-bottom-right"
          style={{ transform: `translate(${mousePos.x * -12}px, ${mousePos.y * 12}px)` }}
        >
          <div className="telemetry-icon-box">
            <span>🌿</span>
          </div>
          <div>
            <div className="telemetry-label">Pharmacopoeia KB</div>
            <div className="telemetry-value">93 Botanical Species</div>
            <div className="telemetry-sub">Therapeutic & Safety Profiles</div>
          </div>
        </div>

        {/* Floating luminous particles */}
        <div className="luminous-spark spark-1"></div>
        <div className="luminous-spark spark-2"></div>
        <div className="luminous-spark spark-3"></div>
        <div className="luminous-spark spark-4"></div>
        <div className="luminous-spark spark-5"></div>
      </div>
    </div>
  );
}
