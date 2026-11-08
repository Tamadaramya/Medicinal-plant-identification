import os
import json
import logging
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from typing import Dict, Any, Optional, Tuple, List

from backend.services.recommender_service import PlantRecommender
import cv2
import io
import base64

logger = logging.getLogger(__name__)

# HuggingFace Model ID for the pretrained ViT
# The checkpoint published with the requested Kaggle notebook.
# The notebook is not a hosted prediction API; Transformers loads this model.
HF_MODEL_ID = os.getenv("PLANT_MODEL_ID", "dima806/medicinal_plants_image_detection")


def ndarray_to_base64(img_array: np.ndarray, format: str = "JPEG") -> str:
    """Encodes numpy RGB image to Base64 data URL string."""
    pil_img = Image.fromarray(img_array)
    buffer = io.BytesIO()
    pil_img.save(buffer, format=format, quality=92)
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime = "image/jpeg" if format.upper() == "JPEG" else "image/png"
    return f"data:{mime};base64,{b64_str}"


def overlay_heatmap(
    original_img_rgb: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.55,
    colormap: int = cv2.COLORMAP_JET
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Overlays the normalized Grad-CAM heatmap onto the original RGB image.
    Returns (colored_heatmap_rgb, overlay_rgb).
    """
    h, w = original_img_rgb.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_LINEAR)
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    colored_bgr = cv2.applyColorMap(heatmap_uint8, colormap)
    colored_rgb = cv2.cvtColor(colored_bgr, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(original_img_rgb, 1.0 - alpha, colored_rgb, alpha, 0)
    return colored_rgb, overlay


def create_side_by_side_visualization(
    original_rgb: np.ndarray,
    colored_heatmap: np.ndarray,
    overlay_rgb: np.ndarray,
    predicted_label: str,
    confidence: float
) -> np.ndarray:
    """
    Creates an academic-ready side-by-side composite:
    [Original Image] | [Grad-CAM Heatmap] | [Overlay]
    with label header.
    """
    h, w, c = original_rgb.shape
    banner_height = 50
    composite_width = w * 3 + 20
    composite = np.zeros((h + banner_height, composite_width, 3), dtype=np.uint8)
    composite[:] = (20, 24, 28)

    composite[banner_height:, 0:w] = original_rgb
    composite[banner_height:, w + 10:w * 2 + 10] = colored_heatmap
    composite[banner_height:, w * 2 + 20:composite_width] = overlay_rgb

    title_text = f"Pred: {predicted_label} | Confidence: {confidence * 100:.1f}%"
    cv2.putText(composite, title_text, (15, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (240, 240, 240), 2, cv2.LINE_AA)

    cv2.putText(composite, "Original", (15, banner_height + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(composite, "Grad-CAM", (w + 25, banner_height + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(composite, "Overlay", (w * 2 + 35, banner_height + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)

    return composite


class ViTGradCAM:
    """
    Grad-CAM over the final ViT encoder block's patch-token features.
    """
    def __init__(self, model):
        self.model = model
        vit = model.vit
        # Transformers 4.x wraps blocks in encoder.layer; 5.x exposes layers.
        blocks = getattr(vit, "layers", None)
        if blocks is None:
            encoder = getattr(vit, "encoder", None)
            blocks = getattr(encoder, "layer", None)
        if blocks is None:
            raise ValueError(
                f"Unsupported ViT encoder layout: {type(vit).__name__} has no encoder.layer or layers blocks"
            )
        self.target_layer = blocks[-1]

    def generate_heatmap(
        self,
        input_tensor: torch.Tensor,
        target_class: Optional[int] = None,
        image_size: int = 224
    ) -> Tuple[np.ndarray, int, float]:
        """
        Generates a gradient-weighted patch-token Grad-CAM heatmap.
        Returns (heatmap_np, class_idx, confidence_prob).
        """
        captured = {}

        def capture_activation(_module, _inputs, output):
            activation = output[0] if isinstance(output, tuple) else output
            captured["activation"] = activation
            activation.register_hook(lambda grad: captured.__setitem__("gradient", grad))

        hook = self.target_layer.register_forward_hook(capture_activation)
        try:
            self.model.eval()
            self.model.zero_grad(set_to_none=True)
            with torch.enable_grad():
                outputs = self.model(input_tensor)
                logits = outputs.logits
                probabilities = F.softmax(logits, dim=1)
                if target_class is None:
                    target_class = int(torch.argmax(logits, dim=1).item())
                confidence = float(probabilities[0, target_class].detach().item())
                logits[0, target_class].backward()

            activations = captured["activation"].detach()
            gradients = captured["gradient"].detach()
            weights = gradients.mean(dim=1, keepdim=True)
            patch_scores = torch.relu((weights * activations).sum(dim=-1))[0, 1:]
            grid_size = int(patch_scores.numel() ** 0.5)
            if grid_size * grid_size != patch_scores.numel():
                raise ValueError(f"Patch token count {patch_scores.numel()} is not a square grid")
            heatmap = patch_scores.reshape(grid_size, grid_size).cpu().numpy()
        finally:
            hook.remove()
            self.model.zero_grad(set_to_none=True)

        # Normalize heatmap to [0, 1]
        h_min, h_max = np.min(heatmap), np.max(heatmap)
        if h_max - h_min > 1e-8:
            heatmap = (heatmap - h_min) / (h_max - h_min)
        else:
            heatmap = np.zeros_like(heatmap)

        return heatmap, target_class, confidence


class InferenceService:
    """
    Confidence-Aware Plant Identification & Explainable AI Service.
    Powered by a pretrained Hugging Face ViT model with patch-token Grad-CAM.
    """
    def __init__(
        self,
        model_path: Optional[str] = None,
        backbone_name: str = "vit_pretrained",
        num_classes: int = 40,
        confidence_threshold: float = 0.70,
        device: Optional[str] = None
    ):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.backbone_name = "vit_pretrained"
        self.confidence_threshold = confidence_threshold

        # Paths
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.saved_models_dir = os.path.join(os.path.dirname(base_dir), "saved_models")
        self.outputs_dir = os.path.join(os.path.dirname(base_dir), "outputs")

        # Load local mappings (kept for backward compatibility with knowledge base)
        self.idx_to_class = self._load_json(os.path.join(self.saved_models_dir, "idx_to_class.json"))
        self.class_to_idx = self._load_json(os.path.join(self.saved_models_dir, "class_to_idx.json"))

        # Recommender & Knowledge Base
        self.recommender = PlantRecommender()
        toxic_path = os.path.join(base_dir, "knowledge_base", "toxic.json")
        self.toxic_db = self._load_json(toxic_path)

        # ----------------------------------------------------------------
        # LOAD HUGGING FACE ViT MODEL (dima806/medicinal_plants_image_detection)
        # ----------------------------------------------------------------
        # Import from the defining modules instead of the top-level lazy
        # exports, which can fail in partially upgraded Transformers installs.
        try:
            from transformers.models.auto.image_processing_auto import AutoImageProcessor
            from transformers.models.auto.modeling_auto import AutoModelForImageClassification
        except ImportError as e:
            raise RuntimeError(
                "The installed Transformers package is incompatible or incomplete. "
                "Install the project requirements with the active Python environment."
            ) from e

        logger.info(f"Loading HuggingFace ViT model: {HF_MODEL_ID} ...")
        self.processor = AutoImageProcessor.from_pretrained(HF_MODEL_ID)
        self.model = AutoModelForImageClassification.from_pretrained(HF_MODEL_ID)
        self.model.to(self.device)
        self.model.eval()

        # Get class labels from the model config (id2label)
        self.hf_id2label = self.model.config.id2label
        self.hf_label2id = self.model.config.label2id
        self.num_classes = len(self.hf_id2label)
        self.model_id = HF_MODEL_ID

        # Setup gradient-weighted ViT patch-token Grad-CAM
        self.gradcam = ViTGradCAM(self.model)

        logger.info(
            f"InferenceService initialized on {self.device} with HuggingFace ViT model "
            f"({HF_MODEL_ID}), {self.num_classes} classes."
        )

    def _load_json(self, path: str) -> Dict:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _match_safety_db(self, class_id: str, botanical_name: str = "", common_name: str = "") -> Optional[Dict[str, Any]]:
        """Match a model candidate to the curated records in toxic.json."""
        def normalized(value: str) -> str:
            return " ".join("".join(char.lower() if char.isalnum() else " " for char in str(value)).split())

        candidates = [normalized(botanical_name), normalized(common_name), normalized(class_id)]
        candidate_genus = next((name.split()[0] for name in candidates if name), "")
        for info in self.toxic_db.get("plants", []):
            toxic_names = [normalized(info.get("plant_name", "")), normalized(info.get("scientific_name") or "")]
            if any(candidate and toxic and (candidate == toxic or candidate in toxic or toxic in candidate)
                   for candidate in candidates for toxic in toxic_names if toxic):
                return info

            # Entries identified only to a genus/species group intentionally match
            # candidates from that genus, while local/common-name entries require
            # an exact name match above.
            scientific_name = normalized(info.get("scientific_name") or "")
            if candidate_genus and scientific_name.startswith(candidate_genus) and (
                "species" in scientific_name or "often " in scientific_name or " or " in scientific_name
            ):
                return info
        return None

    def _hf_label_to_local_class(self, hf_label: str) -> str:
        """
        Maps a HuggingFace model label (e.g. 'Tulsi (Ocimum Sanctum)') to the
        local class ID used in the knowledge base (e.g. '95_Ocimum_sanctum').
        Falls back to the raw HF label if no match is found.
        """
        hf_label_lower = hf_label.lower().strip()

        # Try direct match with local idx_to_class values
        for idx, cls_name in self.idx_to_class.items():
            # Extract botanical name from folder-style name like "95_Ocimum_sanctum"
            parts = cls_name.split("_", 1)
            if len(parts) > 1 and parts[0].isdigit():
                botanical = parts[1].replace("_", " ").lower()
            else:
                botanical = cls_name.replace("_", " ").lower()

            if botanical in hf_label_lower or hf_label_lower in botanical:
                return cls_name

        # Try matching against knowledge base botanical names
        for plant_id, plant_data in self.recommender.plants_data.items():
            bot_name = plant_data.get("botanical_name", "").lower()
            if bot_name and (bot_name in hf_label_lower or hf_label_lower in bot_name):
                return plant_id

            # Also try common names
            common_names = plant_data.get("common_names", {})
            for lang, name in common_names.items():
                if name and name.lower() in hf_label_lower:
                    return plant_id

        # Return a cleaned version of the HF label as class_id
        return hf_label.replace(" ", "_").replace("(", "").replace(")", "").strip("_")

    def predict(
        self,
        pil_image: Image.Image,
        threshold: Optional[float] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Executes end-to-end plant identification using HuggingFace ViT:
        1. Preprocesses image with HuggingFace AutoImageProcessor.
        2. Runs ViT (Vision Transformer) inference.
        3. Applies confidence-aware thresholding and Top-K candidate ranking.
        4. Checks the top five candidates against toxic.json and attaches its safety guidance.
        5. Detects confused morphological classes (margin < 15%) and attaches differential guidance.
        6. Computes ViT Attention-based Grad-CAM heatmap overlays.
        7. Enriches result with classical Ayurvedic monograph and phytochemical profile.
        """
        current_threshold = threshold if threshold is not None else self.confidence_threshold

        # Ensure RGB
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")

        orig_w, orig_h = pil_image.size
        orig_np = np.array(pil_image)

        # Preprocess with HuggingFace processor
        inputs = self.processor(images=pil_image, return_tensors="pt")
        input_tensor = inputs["pixel_values"].to(self.device)

        # -------------------------------------------------------------
        # STEP 1: VIT MODEL INFERENCE (TRANSFORMER FORWARD PASS)
        # -------------------------------------------------------------
        with torch.no_grad():
            outputs = self.model(input_tensor)
            logits = outputs.logits
            probabilities = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        top_indices = np.argsort(probabilities)[::-1][:top_k]
        top_k_list = []
        for idx in top_indices:
            hf_label = self.hf_id2label.get(int(idx), f"class_{idx}")
            local_cls = self._hf_label_to_local_class(hf_label)
            kb_entry = self.recommender.get_plant_detail(local_cls) or {}

            top_k_list.append({
                "class_index": int(idx),
                "class_id": local_cls,
                "hf_label": hf_label,
                "botanical_name": kb_entry.get("botanical_name", hf_label),
                "common_name": kb_entry.get("common_names", {}).get("english") or kb_entry.get("common_names", {}).get("hindi", hf_label),
                "confidence": float(round(probabilities[idx], 4)),
                "confidence_percent": float(round(probabilities[idx] * 100, 2))
            })

        best_idx = int(top_indices[0])
        best_hf_label = self.hf_id2label.get(best_idx, f"class_{best_idx}")
        best_class = self._hf_label_to_local_class(best_hf_label)
        best_confidence = float(probabilities[best_idx])
        engine_used = f"Hugging Face ViT ({self.model_id})"

        is_confident = (best_confidence >= current_threshold)
        status = "CONFIDENT" if is_confident else "UNCERTAIN"

        # -------------------------------------------------------------
        # STEP 2: Match every top-five candidate to the curated toxic plant guide.
        # -------------------------------------------------------------
        safety_matches = []
        for rank, cand in enumerate(top_k_list[:5], start=1):
            cid = cand.get("class_id", "")
            c_bot = cand.get("botanical_name", "")
            tox_info = self._match_safety_db(cid, c_bot, cand.get("common_name", ""))

            if tox_info:
                cand_conf = cand.get("confidence", 0.0)
                cand_pct = cand.get("confidence_percent", cand_conf * 100.0)
                safety_info = {
                    **tox_info,
                    "rank": rank,
                    "class_id": cid,
                    "confidence_percent": cand_pct,
                }
                cand["toxicity"] = safety_info
                safety_matches.append(safety_info)

        toxic_found = bool(safety_matches)
        has_critical = any(str(t.get("toxicity_level", "")).lower().startswith("critical") for t in safety_matches)

        if toxic_found:
            species_names = [f"{t.get('plant_name', t.get('scientific_name') or 'Plant')} [{t['confidence_percent']}%]" for t in safety_matches]
            alert_msg = (
                f"Safety warning: {', '.join(species_names)} from the top five predictions has a safety record in toxic.json. "
                "Predictions are uncertain; do not use this image result alone to identify a plant or decide it is safe."
            )
            status_alert = "SAFETY_ALERT"
            alert_level = "CRITICAL" if has_critical else "WARNING"
        else:
            alert_msg = "No matching plant safety records were found in the top five candidates. This does not establish that the plant is safe."
            status_alert = "NO_TOXIC_FOUND"
            alert_level = "SAFE"

        toxic_check_result = {
            "toxic_found": toxic_found,
            "status": status_alert,
            "alert_level": alert_level,
            "toxic_count": len(safety_matches),
            "toxic_plants": safety_matches,
            "alert_message": alert_msg,
            "general_safety_rules": self.toxic_db.get("metadata", {}).get("general_safety_rules", []),
            "first_aid_guidance": self.toxic_db.get("metadata", {}).get("first_aid_guidance", {}),
        }

        # -------------------------------------------------------------
        # STEP 3: CONFUSED-CLASS CHECK (Margin < 15%)
        # -------------------------------------------------------------
        confused_check_result = {"is_confused": False}
        if len(top_k_list) >= 2:
            first_conf = top_k_list[0]["confidence"]
            second_conf = top_k_list[1]["confidence"]
            second_class = top_k_list[1]["class_id"]
            margin = first_conf - second_conf
            is_confused = (margin < 0.15)

            p1_meta = self.recommender.get_plant_detail(best_class) or {}
            p2_meta = self.recommender.get_plant_detail(second_class) or {}

            # Fallback search if direct key not matched
            if not p1_meta:
                for k, v in self.recommender.plants_data.items():
                    if best_class.lower() in k.lower():
                        p1_meta = v
                        break
            if not p2_meta:
                for k, v in self.recommender.plants_data.items():
                    if second_class.lower() in k.lower():
                        p2_meta = v
                        break

            diff_guide = (
                f"Top-1 ({p1_meta.get('sanskrit_name') or best_class}) and Top-2 ({p2_meta.get('sanskrit_name') or second_class}) "
                f"share close visual predictions (margin: {margin * 100:.1f}%). "
                f"Distinguishing keys: Family differences ({p1_meta.get('family', 'N/A')} vs {p2_meta.get('family', 'N/A')}), "
                f"habit difference ({p1_meta.get('habit', 'N/A')} vs {p2_meta.get('habit', 'N/A')}), and leaf venation should be examined."
            ) if is_confused else "Top candidate dominates prediction; minimal morphological ambiguity."

            confused_check_result = {
                "is_confused": is_confused,
                "confidence_margin_percent": round(margin * 100, 2),
                "top1_class": best_class,
                "top2_class": second_class,
                "candidate_1": {
                    "class_id": best_class,
                    "botanical_name": p1_meta.get("botanical_name", best_class),
                    "sanskrit_name": p1_meta.get("sanskrit_name") or p1_meta.get("common_names", {}).get("sanskrit", ""),
                    "family": p1_meta.get("family", "Unknown"),
                    "habit": p1_meta.get("habit", "Unknown"),
                    "dosage": p1_meta.get("dosage", "N/A"),
                    "virya": p1_meta.get("ayurvedic_properties", {}).get("virya", "N/A"),
                    "confidence_percent": round(first_conf * 100, 2)
                },
                "candidate_2": {
                    "class_id": second_class,
                    "botanical_name": p2_meta.get("botanical_name", second_class),
                    "sanskrit_name": p2_meta.get("sanskrit_name") or p2_meta.get("common_names", {}).get("sanskrit", ""),
                    "family": p2_meta.get("family", "Unknown"),
                    "habit": p2_meta.get("habit", "Unknown"),
                    "dosage": p2_meta.get("dosage", "N/A"),
                    "virya": p2_meta.get("ayurvedic_properties", {}).get("virya", "N/A"),
                    "confidence_percent": round(second_conf * 100, 2)
                },
                "differential_guidance": diff_guide
            }

        # -------------------------------------------------------------
        # STEP 4: VIT GRAD-CAM HEATMAP COMPUTATION
        # -------------------------------------------------------------
        try:
            heatmap, _, _ = self.gradcam.generate_heatmap(
                input_tensor, target_class=best_idx
            )
        except Exception as e:
            logger.exception("ViT Grad-CAM generation failed")
            raise RuntimeError("Prediction succeeded, but Grad-CAM generation failed.") from e

        # Limit visualization display dimension to 600px for responsive UI speed
        max_dim = 600
        if max(orig_w, orig_h) > max_dim:
            scale = max_dim / max(orig_w, orig_h)
            disp_w, disp_h = int(orig_w * scale), int(orig_h * scale)
            display_orig_rgb = np.array(pil_image.resize((disp_w, disp_h), Image.Resampling.BILINEAR))
        else:
            display_orig_rgb = orig_np

        # Overlay heatmap
        colored_heatmap_rgb, overlay_rgb = overlay_heatmap(
            original_img_rgb=display_orig_rgb,
            heatmap=heatmap,
            alpha=0.55
        )

        composite = create_side_by_side_visualization(
            original_rgb=display_orig_rgb,
            colored_heatmap=colored_heatmap_rgb,
            overlay_rgb=overlay_rgb,
            predicted_label=best_hf_label,
            confidence=best_confidence
        )

        original_b64 = ndarray_to_base64(display_orig_rgb, format="JPEG")
        heatmap_b64 = ndarray_to_base64(colored_heatmap_rgb, format="JPEG")
        overlay_b64 = ndarray_to_base64(overlay_rgb, format="JPEG")
        composite_b64 = ndarray_to_base64(composite, format="JPEG")

        # -------------------------------------------------------------
        # STEP 5: BOTANICAL & AYURVEDIC KNOWLEDGE MONOGRAPH
        # -------------------------------------------------------------
        plant_profile = self.recommender.get_plant_detail(best_class)
        if not plant_profile:
            for k, v in self.recommender.plants_data.items():
                if best_class.lower() in k.lower() or k.lower() in best_class.lower():
                    plant_profile = v
                    break
        plant_profile = plant_profile or {}

        # Explanation diagnostic summary
        if is_confident:
            explanation_text = (
                f"The ViT (Vision Transformer) model identified this specimen as {plant_profile.get('botanical_name', best_hf_label)} "
                f"({plant_profile.get('sanskrit_name', '')}) with {best_confidence * 100:.1f}% confidence. "
                f"Visual attention-based Grad-CAM explanation indicates high activation on key diagnostic morphological structures."
            )
        else:
            explanation_text = (
                f"The ViT model's highest candidate is {plant_profile.get('botanical_name', best_hf_label)}, "
                f"but confidence ({best_confidence * 100:.1f}%) is below the required safety threshold ({current_threshold * 100:.1f}%)."
            )

        # Warning text logic
        warning_parts = []
        if toxic_found:
            warning_parts.append("Safety record found for a plant in the top five predictions. Do not use this image result alone to identify a plant or decide it is safe.")

        if not is_confident:
            warning_parts.append(
                "Identification uncertain → Please upload a clearer image of the plant leaf or stem with good natural lighting, minimal background clutter, and sharp focus."
            )

        warning_text = " ".join(warning_parts) if warning_parts else None

        return {
            "predicted_class": best_class,
            "hf_predicted_label": best_hf_label,
            "botanical_name": plant_profile.get("botanical_name", best_hf_label),
            "sanskrit_name": plant_profile.get("sanskrit_name", ""),
            "family": plant_profile.get("family", "Unknown"),
            "habit": plant_profile.get("habit", "Unknown"),
            "dosage": plant_profile.get("dosage", "N/A"),
            "common_names": plant_profile.get("common_names", {}),
            "confidence": round(best_confidence, 4),
            "confidence_percent": round(best_confidence * 100, 2),
            "confidence_threshold": current_threshold,
            "status": status,
            "is_confident": is_confident,
            "explanation": explanation_text,
            "warning": warning_text,
            "toxic_check": toxic_check_result,
            "confused_check": confused_check_result,
            "top_predictions": top_k_list,
            "plant_profile": plant_profile,
            "engine": engine_used,
            "visualizations": {
                "original": original_b64,
                "heatmap": heatmap_b64,
                "overlay": overlay_b64,
                "composite": composite_b64
            }
        }
