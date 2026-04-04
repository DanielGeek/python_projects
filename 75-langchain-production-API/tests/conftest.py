"""
Pytest configuration and fixtures for API tests.
Initializes global components that would normally be initialized in the lifespan context.
"""

import pytest
from app.config import get_settings
from app.security import SecurityPipeline
from app.cache import ResponseCache
from app.monitoring import MetricsCollector
from app.agent import ProductionAgent
import app.main as main_module


@pytest.fixture(scope="session", autouse=True)
def initialize_app_components():
    """
    Initialize global components before any tests run.
    This mimics what the lifespan context manager does in production.
    """
    settings = get_settings()
    
    # Initialize global components
    main_module.security = SecurityPipeline()
    main_module.cache = ResponseCache(ttl_seconds=settings.cache_ttl_seconds)
    main_module.metrics = MetricsCollector()
    main_module.agent = ProductionAgent()
    
    yield
    
    # Cleanup (optional)
    main_module.security = None
    main_module.cache = None
    main_module.metrics = None
    main_module.agent = None


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (require API keys)"
    )
