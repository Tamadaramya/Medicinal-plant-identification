import React, { useState } from 'react';

export default function WorkflowSection({ onNavigate }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Upload Plant Image',
      category: 'Input Capture',
      desc: 'User captures or uploads a leaf or whole-plant specimen image (JPG, PNG, WEBP).',
      detail: 'Supports drag-and-drop, camera uploads, or authentic benchmark specimens from 93 Indian medicinal species.',
      icon: '📷',
    },
    {
      num: '02',
      title: 'Image Preprocessing',
      category: 'Pipeline Prep',
      desc: 'Automatic image cleaning, corrupted pixel rejection, RGB normalization, and resizing.',
      detail: 'Standardizes input tensor to 224×224 spatial dimensions with ImageNet-calibrated mean and standard deviation.',
      icon: '⚙️',
    },
    {
      num: '03',
      title: 'Deep Vision Prediction',
      category: 'Feature Extraction',
      desc: 'Deep neural network processes spatial patch tokens and convolutional features.',
      detail: 'Passes normalized tensor through hierarchical encoder blocks, mapping morphological features (margins, venation).',
      icon: '🧠',
    },
    {
      num: '04',
      title: 'Softmax Top-K Results',
      category: 'Probability Calibration',
      desc: 'Computes multi-class probability distribution across all 93 target medicinal plant species.',
      detail: 'Generates ranked Top-5 prediction candidates with explicit percentage confidence margins.',
      icon: '📊',
    },
    {
      num: '05',
      title: 'Toxic Plant Safety Check',
      category: 'Clinical Safety',
      desc: 'Immediate safety screening against toxic lookalikes (e.g. Aconitum ferox, Calotropis procera).',
      detail: 'Cross-references the toxic lookalike database, triggering caution banners if hazardous compounds or latex exist.',
      icon: '⚠️',
    },
    {
      num: '06',
      title: 'Confidence Assessment',
      category: 'Decision Gate',
      desc: 'Softmax probability evaluated against a configurable threshold τ (default 70%).',
      detail: 'Predictions ≥ 70% earn CONFIDENT status; lower scores trigger UNCERTAIN advisories instructing recapture.',
      icon: '🎯',
    },
    {
      num: '07',
      title: 'Confused-Class Verification',
      category: 'Diagnostic Audit',
      desc: 'Evaluates botanical lookalikes and confused pairs across candidate species.',
      detail: 'Flags ambiguous botanical taxa (e.g., Ocimum sanctum vs Ocimum basilicum) to prevent false certainty.',
      icon: '🔍',
    },
    {
      num: '08',
      title: 'Final Plant Prediction',
      category: 'Classification',
      desc: 'Designation of the primary botanical species with verified confidence margin.',
      detail: 'Outputs verified botanical binomial name, family classification, and vernacular regional identifiers.',
      icon: '🌿',
    },
    {
      num: '09',
      title: 'Grad-CAM Explainability',
      category: 'XAI Attribution',
      desc: 'Backpropagates pooled gradients to generate high-resolution Jet activation heatmaps.',
      detail: 'Computes pooled gradients α_k^c over features[-1] to highlight exact morphological leaf drivers driving classification.',
      icon: '🔬',
    },
    {
      num: '10',
      title: 'Plant Knowledge Retrieval',
      category: 'Ayurvedic Monograph',
      desc: 'Instant retrieval of complete pharmacopoeia monograph from the 93-species database.',
      detail: 'Attaches therapeutic uses, active phytochemicals (withanolides, curcumin), classical doshas, and formulations.',
      icon: '📜',
    },
  ];

  return (
    <section className="workflow-section">
      <div className="section-header">
        <div className="section-badge">PIPELINE ARCHITECTURE</div>
        <h2 className="section-title">From Plant Image to AI-Powered Discovery</h2>
        <p className="section-subtitle">
          An authentic 10-stage scientific pipeline engineered for safety, diagnostic transparency,
          and botanical precision.
        </p>
      </div>

      {/* Horizontal Scroll / Stepper Bar */}
      <div className="workflow-stepper-container">
        <div className="workflow-stepper">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`workflow-step-item ${activeStep === idx ? 'active' : ''} ${idx < activeStep ? 'completed' : ''}`}
              onClick={() => setActiveStep(idx)}
            >
              <div className="step-circle">
                <span className="step-num">{step.num}</span>
              </div>
              <div className="step-label">{step.title}</div>
              {idx < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Active Step Detailed Card */}
      <div className="workflow-detail-card">
        <div className="detail-card-left">
          <div className="detail-badge-row">
            <span className="detail-step-badge">Stage {steps[activeStep].num} of 10</span>
            <span className="detail-category-badge">{steps[activeStep].category}</span>
          </div>
          <h3 className="detail-title">{steps[activeStep].title}</h3>
          <p className="detail-desc">{steps[activeStep].desc}</p>
          <div className="detail-box">
            <span className="detail-box-label">Technical Implementation:</span>
            <p className="detail-box-text">{steps[activeStep].detail}</p>
          </div>

          <div className="detail-nav-row">
            <button
              className="step-nav-btn"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            >
              ← Previous Stage
            </button>
            <button
              className="step-nav-btn primary"
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
            >
              Next Stage →
            </button>
            <button
              className="step-action-cta"
              onClick={() => onNavigate('identify')}
            >
              Test This Pipeline Live →
            </button>
          </div>
        </div>

        <div className="detail-card-right">
          <div className="stage-visual-icon">{steps[activeStep].icon}</div>
          <div className="stage-visual-meta">
            <div className="meta-line">
              <span className="meta-key">Status:</span>
              <span className="meta-val green">Active Pipeline Block</span>
            </div>
            <div className="meta-line">
              <span className="meta-key">Model Hook:</span>
              <span className="meta-val">PyTorch Autocast / ViT</span>
            </div>
            <div className="meta-line">
              <span className="meta-key">Decision:</span>
              <span className="meta-val">Confidence-Gated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

