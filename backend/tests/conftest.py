import pytest
from fastapi.testclient import TestClient
import json
import os
from pathlib import Path

# Import your FastAPI app
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from api import app

@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def sample_recipe():
    """Sample recipe data for testing"""
    return {
        "name": "Test Recipe",
        "ingredients": "ingredient 1\ningredient 2",
        "steps": "step 1\nstep 2",
        "imageUrl": "https://example.com/image.jpg",
        "tags": ["test", "quick"]
    }

@pytest.fixture
def sample_comment():
    """Sample comment data for testing"""
    return {
        "author": "Test Author",
        "text": "Test comment text",
        "recipe_id": 1
    }

@pytest.fixture(autouse=True)
def backup_and_restore_data():
    """Backup data before tests and restore after"""
    recipes_file = Path(__file__).parent.parent / "recipes.json"
    comments_file = Path(__file__).parent.parent / "comments.json"

    # Backup
    recipes_backup = None
    comments_backup = None

    if recipes_file.exists():
        with open(recipes_file, 'r') as f:
            recipes_backup = f.read()

    if comments_file.exists():
        with open(comments_file, 'r') as f:
            comments_backup = f.read()

    yield

    # Restore
    if recipes_backup:
        with open(recipes_file, 'w') as f:
            f.write(recipes_backup)
    else:
        # If there was no backup, remove the file
        if recipes_file.exists():
            recipes_file.unlink()

    if comments_backup:
        with open(comments_file, 'w') as f:
            f.write(comments_backup)
    else:
        # If there was no backup, remove the file
        if comments_file.exists():
            comments_file.unlink()
