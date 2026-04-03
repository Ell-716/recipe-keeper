import pytest
from fastapi import status

def test_add_comment_to_recipe(client, sample_recipe, sample_comment):
    """Test POST /recipes/{id}/comments endpoint"""
    # Create a recipe first
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Add a comment
    comment_data = sample_comment.copy()
    comment_data["recipe_id"] = recipe_id
    response = client.post(f"/recipes/{recipe_id}/comments", json=comment_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert data["author"] == sample_comment["author"]
    assert data["text"] == sample_comment["text"]
    assert data["recipe_id"] == recipe_id

def test_get_recipe_comments(client, sample_recipe, sample_comment):
    """Test GET /recipes/{id}/comments endpoint"""
    # Create a recipe
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Add a comment
    comment_data = sample_comment.copy()
    comment_data["recipe_id"] = recipe_id
    client.post(f"/recipes/{recipe_id}/comments", json=comment_data)

    # Get comments
    response = client.get(f"/recipes/{recipe_id}/comments")
    assert response.status_code == status.HTTP_200_OK
    comments = response.json()
    assert len(comments) > 0
    assert comments[0]["author"] == sample_comment["author"]

def test_get_comments_empty_list(client, sample_recipe):
    """Test getting comments for a recipe with no comments"""
    # Create a recipe
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Get comments (should be empty)
    response = client.get(f"/recipes/{recipe_id}/comments")
    assert response.status_code == status.HTTP_200_OK
    comments = response.json()
    assert len(comments) == 0

def test_delete_comment(client, sample_recipe, sample_comment):
    """Test DELETE /comments/{id} endpoint"""
    # Create a recipe and comment
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]
    comment_data = sample_comment.copy()
    comment_data["recipe_id"] = recipe_id
    comment_response = client.post(f"/recipes/{recipe_id}/comments", json=comment_data)
    comment_id = comment_response.json()["id"]

    # Delete the comment
    response = client.delete(f"/comments/{comment_id}")
    assert response.status_code == status.HTTP_200_OK

    # Verify it's deleted
    get_response = client.get(f"/recipes/{recipe_id}/comments")
    comments = get_response.json()
    assert not any(c["id"] == comment_id for c in comments)

def test_delete_nonexistent_comment(client):
    """Test deleting a non-existent comment"""
    response = client.delete("/comments/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_add_comment_to_nonexistent_recipe(client, sample_comment):
    """Test adding comment to non-existent recipe"""
    comment_data = sample_comment.copy()
    comment_data["recipe_id"] = 99999
    response = client.post("/recipes/99999/comments", json=comment_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_multiple_comments_on_recipe(client, sample_recipe, sample_comment):
    """Test adding multiple comments to a recipe"""
    # Create a recipe
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Add first comment
    comment_data1 = sample_comment.copy()
    comment_data1["recipe_id"] = recipe_id
    comment_data1["author"] = "Author 1"
    client.post(f"/recipes/{recipe_id}/comments", json=comment_data1)

    # Add second comment
    comment_data2 = sample_comment.copy()
    comment_data2["recipe_id"] = recipe_id
    comment_data2["author"] = "Author 2"
    client.post(f"/recipes/{recipe_id}/comments", json=comment_data2)

    # Get comments
    response = client.get(f"/recipes/{recipe_id}/comments")
    comments = response.json()
    assert len(comments) == 2
    authors = [c["author"] for c in comments]
    assert "Author 1" in authors
    assert "Author 2" in authors

def test_comment_validation(client, sample_recipe):
    """Test comment creation with invalid data"""
    # Create a recipe
    create_response = client.post("/recipes", json=sample_recipe)
    recipe_id = create_response.json()["id"]

    # Try to add comment with missing fields
    invalid_comment = {
        "author": "",  # Empty author
        "text": "",    # Empty text
        "recipe_id": recipe_id
    }
    response = client.post(f"/recipes/{recipe_id}/comments", json=invalid_comment)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
