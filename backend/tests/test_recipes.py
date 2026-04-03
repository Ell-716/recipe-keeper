import pytest
from fastapi import status

def test_get_all_recipes(client):
    """Test GET /recipes endpoint"""
    response = client.get("/recipes")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)

def test_create_recipe(client, sample_recipe):
    """Test POST /recipes endpoint"""
    response = client.post("/recipes", json=sample_recipe)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert data["name"] == sample_recipe["name"]
    assert data["ingredients"] == sample_recipe["ingredients"]

def test_get_recipe_by_id(client, sample_recipe):
    """Test GET /recipes/{id} endpoint"""
    # Create a recipe first
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Get the recipe
    response = client.get(f"/recipes/{recipe_id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == recipe_id

def test_get_nonexistent_recipe(client):
    """Test GET /recipes/{id} with invalid ID"""
    response = client.get("/recipes/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_recipe(client, sample_recipe):
    """Test PUT /recipes/{id} endpoint"""
    # Create a recipe first
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Update the recipe
    updated_data = sample_recipe.copy()
    updated_data["name"] = "Updated Recipe Name"
    response = client.put(f"/recipes/{recipe_id}", json=updated_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Updated Recipe Name"

def test_delete_recipe(client, sample_recipe):
    """Test DELETE /recipes/{id} endpoint"""
    # Create a recipe first
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Delete the recipe
    response = client.delete(f"/recipes/{recipe_id}")
    assert response.status_code == status.HTTP_200_OK

    # Verify it's deleted
    get_response = client.get(f"/recipes/{recipe_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_search_recipes(client, sample_recipe):
    """Test GET /recipes with search query"""
    # Create a recipe first
    client.post("/recipes", json=sample_recipe)

    # Search for it
    response = client.get("/recipes?search=Test")
    assert response.status_code == status.HTTP_200_OK
    results = response.json()
    assert len(results) > 0
    assert any("Test" in r["name"] for r in results)

def test_search_recipes_by_ingredients(client, sample_recipe):
    """Test searching recipes by ingredients"""
    # Create a recipe first
    client.post("/recipes", json=sample_recipe)

    # Search by ingredients
    response = client.get("/recipes?search=ingredient")
    assert response.status_code == status.HTTP_200_OK
    results = response.json()
    assert len(results) > 0

def test_search_recipes_by_steps(client, sample_recipe):
    """Test searching recipes by steps"""
    # Create a recipe first
    client.post("/recipes", json=sample_recipe)

    # Search by steps
    response = client.get("/recipes?search=step")
    assert response.status_code == status.HTTP_200_OK
    results = response.json()
    assert len(results) > 0

def test_create_recipe_validation(client):
    """Test recipe creation with invalid data"""
    invalid_recipe = {
        "name": "",  # Empty name should fail validation
        "ingredients": "",
        "steps": ""
    }
    response = client.post("/recipes", json=invalid_recipe)
    assert response.status_code == 422

def test_recipe_comment_count(client, sample_recipe, sample_comment):
    """Test that recipes include comment counts"""
    # Create a recipe
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Add a comment
    comment_data = sample_comment.copy()
    comment_data["recipe_id"] = recipe_id
    client.post(f"/recipes/{recipe_id}/comments", json=comment_data)

    # Get all recipes and check comment count
    response = client.get("/recipes")
    recipes = response.json()
    recipe = next((r for r in recipes if r["id"] == recipe_id), None)
    assert recipe is not None
    assert "comment_count" in recipe
    assert recipe["comment_count"] == 1

def test_delete_recipe_cascades_comments(client, sample_recipe, sample_comment):
    """Test that deleting a recipe also deletes its comments"""
    # Create a recipe
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Add a comment
    comment_data = sample_comment.copy()
    comment_data["recipe_id"] = recipe_id
    comment_response = client.post(f"/recipes/{recipe_id}/comments", json=comment_data)
    comment_id = comment_response.json()["id"]

    # Delete the recipe
    client.delete(f"/recipes/{recipe_id}")

    # Verify comments are also deleted
    comments_response = client.get(f"/recipes/{recipe_id}/comments")
    comments = comments_response.json()
    assert len(comments) == 0
