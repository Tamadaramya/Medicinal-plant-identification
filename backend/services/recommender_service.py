import json
import os
import re
import requests
from typing import List, Dict, Any, Optional

from backend.config import AppConfig


class PlantRecommender:
    """
    Intelligent Ayurvedic & Botanical Recommender Engine.
    Maps user symptoms, diseases, and body system ailments to ranked medicinal plant recommendations.
    """
    def __init__(self, kb_path: Optional[str] = None):
        if kb_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            kb_path = os.path.join(base_dir, "knowledge_base", "plants_kb.json")
        
        self.kb_path = kb_path
        self.plants_data: Dict[str, Dict[str, Any]] = {}
        self.load_knowledge_base()
        self.recommendation_records = self._load_recommendation_records()
        self.pinecone_api_key = AppConfig.PINECONE_API_KEY
        self.pinecone_index_host = AppConfig.PINECONE_INDEX_HOST
        self.pinecone_namespace = AppConfig.PINECONE_NAMESPACE

    def _load_recommendation_records(self) -> List[Dict[str, Any]]:
        path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                            "knowledge_base", "recommendation.json")
        if not os.path.isfile(path):
            return []
        with open(path, "r", encoding="utf-8") as source:
            data = json.load(source)
        return data if isinstance(data, list) else [data]

    @property
    def semantic_search_ready(self) -> bool:
        return bool(self.pinecone_api_key and self.pinecone_index_host and self.pinecone_namespace)

    @staticmethod
    def _normalized(value: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", str(value).lower()).strip()

    @staticmethod
    def _record_text(value: Any) -> str:
        if isinstance(value, dict):
            return " ".join(PlantRecommender._record_text(item) for item in value.values())
        if isinstance(value, list):
            return " ".join(PlantRecommender._record_text(item) for item in value)
        if isinstance(value, (str, int, float)):
            return str(value)
        return ""

    def _search_pinecone(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """Search the configured integrated-embedding Pinecone index."""
        host = self.pinecone_index_host.rstrip("/")
        if not host.startswith(("https://", "http://")):
            host = f"https://{host}"
        namespace = requests.utils.quote(self.pinecone_namespace, safe="")
        response = requests.post(
            f"{host}/records/namespaces/{namespace}/search",
            headers={
                "Api-Key": self.pinecone_api_key,
                "X-Pinecone-Api-Version": "2025-10",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={"query": {"inputs": {"text": query}, "top_k": max(1, min(int(max_results), 20))}},
            timeout=20,
        )
        if not response.ok:
            raise RuntimeError(f"Pinecone search failed with HTTP {response.status_code}.")
        return response.json().get("result", {}).get("hits", [])

    def _attach_recommendation_context(self, result: Dict[str, Any], plant: Dict[str, Any]):
        aliases = [plant.get("botanical_name", ""), plant.get("common_name_en", ""), plant.get("sanskrit_name", "")]
        aliases.extend((plant.get("common_names") or {}).values())
        for record in self.recommendation_records:
            record_plant = record.get("plant", {})
            record_names = [record_plant.get("scientific_name", ""), *record_plant.get("common_names", [])]
            if not any(self._normalized(name) == self._normalized(alias)
                       for name in record_names for alias in aliases if name and alias):
                continue
            safety = record.get("safety", {})
            if safety.get("recommendation_blocked") is True:
                return None
            dosage = record.get("dosage", {})
            traditional_use = record.get("traditional_use", {})
            safety_notes = safety.get("contraindications", []) + safety.get("potential_interactions", [])
            if safety.get("emergency_action"):
                safety_notes.append(safety["emergency_action"])
            result["medicinal_summary"] = traditional_use.get("summary") or result.get("medicinal_summary")
            result["therapeutic_indications"] = traditional_use.get("indications", result.get("therapeutic_indications", []))
            result["precautions"] = " ".join(safety_notes) or result.get("precautions")
            result["evidence_status"] = traditional_use.get("evidence_status")
            result["recommendation_context"] = {
                "traditional_use": traditional_use,
                "symptom_matching": record.get("symptom_matching", {}),
                "preparation": record.get("preparation", []),
                "dosage": dosage,
                "age_safety": record.get("age_safety", {}),
                "safety": safety,
                "availability": record.get("availability", {}),
                "sources": record.get("sources", []),
                "review": record.get("review", {}),
            }
            if dosage.get("status") != "verified":
                result["dosage"] = "Not verified"
            break
        return result

    def recommend_semantic(self, query: str, selected_part: Optional[str] = None,
                           selected_system: Optional[str] = None, max_results: int = 8) -> List[Dict[str, Any]]:
        """Retrieve semantically similar plant records from Pinecone."""
        hits = self._search_pinecone(query, max_results)
        local_by_id = {
            result["plant_id"]: result
            for result in self.recommend(query, selected_part, selected_system, max_results=len(self.plants_data))
        }
        output = []
        seen = set()
        for hit in hits:
            fields = hit.get("fields") or hit.get("metadata") or {}
            text = self._normalized(self._record_text(fields))
            safety = fields.get("safety", {})
            if isinstance(safety, dict) and safety.get("recommendation_blocked") is True:
                continue
            for plant_id, plant in self.plants_data.items():
                aliases = [plant.get("botanical_name", ""), plant.get("common_name_en", "")]
                aliases.extend((plant.get("common_names") or {}).values())
                aliases.append(plant.get("sanskrit_name", ""))
                if not any((alias := self._normalized(name)) and (alias in text or text in alias) for name in aliases):
                    continue
                if plant_id in seen:
                    break
                if selected_part and selected_part.lower() not in " ".join(plant.get("parts_used", [])).lower():
                    break
                if selected_system and selected_system.lower() not in " ".join(plant.get("body_systems", [])).lower():
                    break
                result = local_by_id.get(plant_id)
                if result is None:
                    names = plant.get("common_names", {})
                    properties = plant.get("ayurvedic_properties", {})
                    result = {
                        "plant_id": plant_id, "id": plant.get("id"),
                        "botanical_name": plant.get("botanical_name"),
                        "sanskrit_name": plant.get("sanskrit_name") or names.get("sanskrit", ""),
                        "common_name_en": plant.get("common_name_en") or names.get("english", ""),
                        "family": plant.get("family"), "habit": plant.get("habit", ""),
                        "dosage": plant.get("dosage", ""), "potency": properties.get("virya", ""),
                        "taste": properties.get("rasa", ""), "guna": properties.get("guna", ""),
                        "vipaka": properties.get("vipaka", ""),
                        "therapeutic_indications": plant.get("therapeutic_indications", []),
                        "common_names": names, "raw_score": 0, "matched_terms": [],
                        "match_rationale": ["Retrieved by Pinecone semantic similarity."],
                        "parts_used": plant.get("parts_used", []),
                        "formulation": plant.get("dosage_and_formulation"),
                        "medicinal_summary": plant.get("medicinal_uses"),
                        "precautions": plant.get("precautions"),
                        "body_systems": plant.get("body_systems", []),
                    }
                score = float(hit.get("_score", 0) or 0)
                result = dict(result)
                result["semantic_score"] = score
                result["relevance_score"] = round(max(0.0, min(0.99, score)) * 100, 1)
                result["match_rationale"] = ["Retrieved by Pinecone semantic similarity."]
                result = self._attach_recommendation_context(result, plant)
                if result is None:
                    continue
                output.append(result)
                seen.add(plant_id)
                break
            if len(output) >= max_results:
                break
        return output

    def load_knowledge_base(self):
        if not os.path.exists(self.kb_path):
            raise FileNotFoundError(f"Knowledge base not found at: {self.kb_path}")
        with open(self.kb_path, "r", encoding="utf-8") as f:
            self.plants_data = json.load(f)

    def _tokenize(self, text: str) -> List[str]:
        """Lowercases and cleans query into significant search tokens."""
        stop_words = {"and", "or", "in", "with", "the", "a", "an", "for", "of", "to", "is", "have", "suffering", "from", "mild", "severe", "feeling"}
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [w for w in cleaned.split() if len(w) > 2 and w not in stop_words]
        return tokens

    def recommend(
        self,
        query: str,
        selected_part: Optional[str] = None,
        selected_system: Optional[str] = None,
        max_results: int = 6
    ) -> List[Dict[str, Any]]:
        """
        Calculates relevance score and returns ranked candidate medicinal plants.
        """
        query_tokens = self._tokenize(query)
        if not query_tokens and not selected_system and not selected_part:
            return []

        results = []

        for plant_id, plant in self.plants_data.items():
            score = 0.0
            matched_terms = set()
            match_rationale = []

            # Filter by plant part if requested
            if selected_part:
                parts_str = " ".join(plant.get("parts_used", [])).lower()
                if selected_part.lower() not in parts_str:
                    continue

            # Filter by body system if requested
            if selected_system:
                systems_str = " ".join(plant.get("body_systems", [])).lower()
                if selected_system.lower() not in systems_str:
                    continue

            # Exact query phrase matching in symptoms or indications
            clean_query = query.lower().strip()
            symptoms_list = [s.lower() for s in plant.get("symptoms", [])]
            indications_list = [ind.lower() for ind in plant.get("therapeutic_indications", [])]
            uses_text = plant.get("medicinal_uses", "").lower()
            systems_list = [sys.lower() for sys in plant.get("body_systems", [])]

            # Check full query match
            for s in symptoms_list:
                if clean_query and (clean_query in s or s in clean_query):
                    score += 25.0
                    matched_terms.add(s)
                    match_rationale.append(f"Direct match with symptom: '{s}'")

            for ind in indications_list:
                if clean_query and (clean_query in ind or ind in clean_query):
                    score += 20.0
                    matched_terms.add(ind)
                    match_rationale.append(f"Direct match with indication: '{ind}'")

            # Check token-level matches
            for token in query_tokens:
                # Symptom matches (weight: 12)
                for s in symptoms_list:
                    if token in s:
                        score += 12.0
                        matched_terms.add(token)
                        if f"Symptom: {s}" not in match_rationale:
                            match_rationale.append(f"Symptom: {s}")

                # Therapeutic indications (weight: 10)
                for ind in indications_list:
                    if token in ind:
                        score += 10.0
                        matched_terms.add(token)
                        if f"Indication: {ind}" not in match_rationale:
                            match_rationale.append(f"Indication: {ind}")

                # Body systems (weight: 6)
                for sys_name in systems_list:
                    if token in sys_name:
                        score += 6.0
                        matched_terms.add(token)

                # Medicinal uses text match (weight: 3)
                if token in uses_text:
                    score += 3.0
                    matched_terms.add(token)

            if score > 0:
                # Normalize confidence match percentage (capped at 99%)
                relevance_pct = min(99.0, max(35.0, round(score * 2.2, 1)))

                results.append({
                    "plant_id": plant_id,
                    "id": plant.get("id"),
                    "botanical_name": plant.get("botanical_name"),
                    "sanskrit_name": plant.get("sanskrit_name") or plant.get("common_names", {}).get("sanskrit", ""),
                    "common_name_en": plant.get("common_name_en") or plant.get("common_names", {}).get("english", ""),
                    "family": plant.get("family"),
                    "habit": plant.get("habit", ""),
                    "dosage": plant.get("dosage", ""),
                    "potency": plant.get("ayurvedic_properties", {}).get("virya", ""),
                    "taste": plant.get("ayurvedic_properties", {}).get("rasa", ""),
                    "guna": plant.get("ayurvedic_properties", {}).get("guna", ""),
                    "vipaka": plant.get("ayurvedic_properties", {}).get("vipaka", ""),
                    "therapeutic_indications": plant.get("therapeutic_indications", []),
                    "common_names": plant.get("common_names", {}),
                    "relevance_score": relevance_pct,
                    "raw_score": score,
                    "matched_terms": list(matched_terms),
                    "match_rationale": match_rationale[:4],
                    "parts_used": plant.get("parts_used", []),
                    "formulation": plant.get("dosage_and_formulation"),
                    "medicinal_summary": plant.get("medicinal_uses"),
                    "precautions": plant.get("precautions"),
                    "body_systems": plant.get("body_systems", [])
                })

        # Sort by relevance descending
        results.sort(key=lambda x: x["raw_score"], reverse=True)
        enriched = []
        for result in results[:max_results]:
            plant = self.plants_data.get(result["plant_id"], {})
            result = self._attach_recommendation_context(result, plant)
            if result is not None:
                enriched.append(result)
        return enriched

    def get_plant_detail(self, plant_id: str) -> Optional[Dict[str, Any]]:
        """Returns the full knowledge monograph for a specific plant."""
        return self.plants_data.get(plant_id)

    def get_all_plants_summary(self) -> List[Dict[str, Any]]:
        """Returns brief summaries of all 93 plants for the herbarium explorer."""
        summaries = []
        for plant_id, p in self.plants_data.items():
            summaries.append({
                "id": plant_id,
                "impr_id": p.get("id"),
                "botanical_name": p.get("botanical_name"),
                "sanskrit_name": p.get("sanskrit_name") or p.get("common_names", {}).get("sanskrit", ""),
                "common_name_en": p.get("common_names", {}).get("english", ""),
                "common_name_hi": p.get("common_names", {}).get("hindi", ""),
                "common_name_sa": p.get("common_names", {}).get("sanskrit", "") or p.get("sanskrit_name", ""),
                "family": p.get("family", ""),
                "habit": p.get("habit", ""),
                "dosage": p.get("dosage", ""),
                "potency": p.get("ayurvedic_properties", {}).get("virya", ""),
                "taste": p.get("ayurvedic_properties", {}).get("rasa", ""),
                "parts_used": p.get("parts_used", []),
                "systems": p.get("body_systems", []),
                "indications": p.get("therapeutic_indications", [])[:3]
            })
        return summaries
