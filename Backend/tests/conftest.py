import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure Backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app
from pipeline.model_service import model_service

@pytest.fixture(scope="session", autouse=True)
def setup_model():
    """Ensure AI model is loaded before running tests."""
    model_service.load_model()
    yield

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client
