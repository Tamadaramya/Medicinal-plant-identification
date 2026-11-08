import os

from dotenv import load_dotenv

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
load_dotenv(os.path.join(PROJECT_ROOT, "backend", ".env"))


def _get_bool(name: str, default: str) -> bool:
    value = os.getenv(name, default).strip().lower()
    if value in {"1", "true", "yes", "on"}:
        return True
    if value in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} must be a boolean value (true/false).")


class AppConfig:
    PROJECT_ROOT = PROJECT_ROOT
    BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
    FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
    SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, "saved_models")
    OUTPUTS_DIR = os.path.join(PROJECT_ROOT, "outputs")
    MANIFESTS_DIR = os.path.join(PROJECT_ROOT, "dataset_manifests")

    HOST = os.getenv("APP_HOST", "127.0.0.1")
    PORT = int(os.getenv("APP_PORT", "5000"))
    DEBUG = _get_bool("APP_DEBUG", "false")

    DEFAULT_CONFIDENCE_THRESHOLD = float(os.getenv("MODEL_CONFIDENCE_THRESHOLD", "0.70"))
    DEFAULT_TOP_K = int(os.getenv("MODEL_TOP_K", "5"))
    DEFAULT_BACKBONE = os.getenv("MODEL_BACKBONE", "vit_pretrained")

    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY") or os.getenv("pinecone")
    PINECONE_INDEX_HOST = os.getenv("PINECONE_INDEX_HOST", "").strip()
    PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "").strip()

    if not 1 <= PORT <= 65535:
        raise ValueError("APP_PORT must be between 1 and 65535.")
    if not 0.0 <= DEFAULT_CONFIDENCE_THRESHOLD <= 1.0:
        raise ValueError("MODEL_CONFIDENCE_THRESHOLD must be between 0 and 1.")
    if DEFAULT_TOP_K < 1:
        raise ValueError("MODEL_TOP_K must be at least 1.")
