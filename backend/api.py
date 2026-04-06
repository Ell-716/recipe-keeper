"""
API for Recipe Keeper Application.

This module provides endpoints for CRUD operations on recipes and comments.
It uses a JSON file for storage, and FastAPI for the web server.
"""

import os
import os.path
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Environment configuration
# In production, set ALLOWED_ORIGINS to your specific domain(s) e.g., "https://yourdomain.com"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:5500,http://127.0.0.1:5500")

# Directory configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATA_DIR can be overridden for production (e.g., /app/data on Fly.io for persistent storage)
DATA_DIR = os.getenv("DATA_DIR", BASE_DIR)
LOG_DIR = os.path.join(BASE_DIR, "logs")

# Create necessary directories
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO if ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(LOG_DIR, "recipe_keeper.log"))
    ]
)
logger = logging.getLogger(__name__)

# Convert comma-separated origins string to list
allowed_origins_list = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup
    logger.info(f"Recipe Keeper API started in {ENVIRONMENT} mode")
    yield
    # Shutdown
    logger.info("Recipe Keeper API shutting down")


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS settings - uses environment variable for allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data files - stored in DATA_DIR for persistent storage
RECIPES_FILE = os.path.join(DATA_DIR, "recipes.json")
COMMENTS_FILE = os.path.join(DATA_DIR, "comments.json")


def load_recipes():
    """
    Load recipes from JSON file into memory.

    If the JSON file does not exist, it initializes an empty list.

    Returns:
        list: A list of recipes.
    """
    logger.debug(f"Reading from {RECIPES_FILE}")
    if not os.path.exists(RECIPES_FILE):
        save_recipes([])

    with open(RECIPES_FILE, "r") as file:
        return json.load(file)


def save_recipes(recipes):
    """
    Save the current state of recipes into JSON file.

    Args:
        recipes (list): List of recipes to save.
    """
    logger.debug(f"Writing to {RECIPES_FILE}")
    with open(RECIPES_FILE, "w") as file:
        json.dump(recipes, file)


def load_comments():
    """
    Load comments from JSON file into memory.

    If the JSON file does not exist, it initializes an empty list.

    Returns:
        list: A list of comments.
    """
    logger.debug(f"Reading from {COMMENTS_FILE}")
    if not os.path.exists(COMMENTS_FILE):
        save_comments([])

    with open(COMMENTS_FILE, "r") as file:
        return json.load(file)


def save_comments(comments):
    """
    Save the current state of comments into JSON file.

    Args:
        comments (list): List of comments to save.
    """
    logger.debug(f"Writing to {COMMENTS_FILE}")
    with open(COMMENTS_FILE, "w") as file:
        json.dump(comments, file)


class Recipe(BaseModel):
    """Recipe Model.

    Attributes:
        id (int): Recipe identifier.
        name (str): Name of the recipe.
        ingredients (str): Ingredients for the recipe.
        steps (str): Steps for preparation.
        imageUrl (str): URL of the recipe image.
        tags (list): List of tags/categories for the recipe.
    """
    id: int = None
    name: str = Field(..., min_length=1)
    ingredients: str = Field(..., min_length=1)
    steps: str = Field(..., min_length=1)
    imageUrl: str = ""
    tags: list = []


class Comment(BaseModel):
    """Comment Model.

    Attributes:
        id (int): Comment identifier.
        recipe_id (int): ID of the recipe this comment belongs to.
        author (str): Name of the comment author.
        text (str): Comment text.
    """
    id: int = None
    recipe_id: int
    author: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


@app.get("/recipes")
@limiter.limit("100/minute")
async def read_recipes(request: Request, search: str = Query(None, description="Search query for filtering recipes")):
    """Retrieve all recipes, optionally filtered by search query.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        search (str, optional): Search query to filter recipes by name, ingredients, or steps.

    Returns:
        list: List of recipes matching the search criteria with comment counts.
    """
    logger.info(f"GET /recipes - search: {search}")
    recipes = load_recipes()
    comments = load_comments()

    # If no search query, return all recipes
    if not search:
        filtered_recipes = recipes
    else:
        # Filter recipes based on search query
        search_lower = search.lower()
        filtered_recipes = [
            recipe for recipe in recipes
            if (search_lower in recipe["name"].lower() or
                search_lower in recipe["ingredients"].lower() or
                search_lower in recipe["steps"].lower())
        ]

    # Add comment counts to each recipe
    for recipe in filtered_recipes:
        recipe_comments = [c for c in comments if c["recipe_id"] == recipe["id"]]
        recipe["comment_count"] = len(recipe_comments)

    logger.debug(f"Returning {len(filtered_recipes)} recipes")
    return filtered_recipes


@app.post("/recipes")
@limiter.limit("20/minute")
async def create_recipe(request: Request, recipe: Recipe):
    """Create a new recipe.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        recipe (Recipe): The recipe details to create.

    Returns:
        dict: The created recipe.
    """
    logger.info(f"POST /recipes - name: {recipe.name}")
    recipes = load_recipes()
    recipe_id = max((recipe["id"] for recipe in recipes), default=0) + 1
    recipe.id = recipe_id
    recipes.append(recipe.model_dump())
    save_recipes(recipes)
    logger.info(f"Recipe {recipe_id} created: {recipe.name}")
    return recipe


@app.get("/recipes/{recipe_id}")
@limiter.limit("100/minute")
async def read_recipe(request: Request, recipe_id: int):
    """Retrieve a single recipe by its ID.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        recipe_id (int): ID of the recipe to retrieve.

    Raises:
        HTTPException: If the recipe with the specified ID is not found.

    Returns:
        dict: The requested recipe.
    """
    logger.info(f"GET /recipes/{recipe_id}")
    recipes = load_recipes()
    recipe = next((recipe for recipe in recipes if recipe["id"] == recipe_id), None)
    if recipe is None:
        logger.warning(f"Recipe {recipe_id} not found")
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@app.put("/recipes/{recipe_id}")
@limiter.limit("20/minute")
async def update_recipe(request: Request, recipe_id: int, updated_recipe: Recipe):
    """Update a recipe by its ID.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        recipe_id (int): ID of the recipe to update.
        updated_recipe (Recipe): New details for the recipe.

    Raises:
        HTTPException: If the recipe with the specified ID is not found.

    Returns:
        dict: The updated recipe.
    """
    logger.info(f"PUT /recipes/{recipe_id}")
    recipes = load_recipes()
    recipe_index = next((index for index, r in enumerate(recipes) if r["id"] == recipe_id), None)

    if recipe_index is None:
        logger.warning(f"Recipe {recipe_id} not found for update")
        raise HTTPException(status_code=404, detail="Recipe not found")

    updated_recipe.id = recipe_id
    recipes[recipe_index] = updated_recipe.model_dump()
    save_recipes(recipes)
    logger.info(f"Recipe {recipe_id} updated: {updated_recipe.name}")
    return updated_recipe


@app.delete("/recipes/{recipe_id}")
@limiter.limit("10/minute")
async def delete_recipe(request: Request, recipe_id: int):
    """Delete a recipe by its ID.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        recipe_id (int): ID of the recipe to delete.

    Raises:
        HTTPException: If the recipe with the specified ID is not found.

    Returns:
        dict: A status message indicating successful deletion.
    """
    logger.info(f"DELETE /recipes/{recipe_id}")
    recipes = load_recipes()
    recipe_index = next((index for index, r in enumerate(recipes) if r["id"] == recipe_id), None)

    if recipe_index is None:
        logger.warning(f"Recipe {recipe_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Recipe not found")

    del recipes[recipe_index]
    save_recipes(recipes)

    # Also delete all comments for this recipe
    comments = load_comments()
    comments = [c for c in comments if c["recipe_id"] != recipe_id]
    save_comments(comments)

    logger.info(f"Recipe {recipe_id} deleted with associated comments")
    return {"status": "success", "message": "Recipe deleted successfully"}


# Comment endpoints
@app.get("/recipes/{recipe_id}/comments")
@limiter.limit("100/minute")
async def get_comments(request: Request, recipe_id: int):
    """Get all comments for a specific recipe.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        recipe_id (int): ID of the recipe.

    Returns:
        list: List of comments for the recipe.
    """
    logger.info(f"GET /recipes/{recipe_id}/comments")
    comments = load_comments()
    recipe_comments = [c for c in comments if c["recipe_id"] == recipe_id]
    logger.debug(f"Returning {len(recipe_comments)} comments for recipe {recipe_id}")
    return recipe_comments


@app.post("/recipes/{recipe_id}/comments")
@limiter.limit("20/minute")
async def add_comment(request: Request, recipe_id: int, comment: Comment):
    """Add a comment to a recipe.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        recipe_id (int): ID of the recipe.
        comment (Comment): Comment data.

    Returns:
        dict: The created comment.
    """
    logger.info(f"POST /recipes/{recipe_id}/comments - author: {comment.author}")
    # Verify recipe exists
    recipes = load_recipes()
    recipe = next((r for r in recipes if r["id"] == recipe_id), None)
    if recipe is None:
        logger.warning(f"Recipe {recipe_id} not found for adding comment")
        raise HTTPException(status_code=404, detail="Recipe not found")

    comments = load_comments()
    comment_id = max((c["id"] for c in comments), default=0) + 1
    comment.id = comment_id
    comment.recipe_id = recipe_id
    comments.append(comment.model_dump())
    save_comments(comments)
    logger.info(f"Comment {comment_id} created for recipe {recipe_id}")
    return comment


@app.delete("/comments/{comment_id}")
@limiter.limit("10/minute")
async def delete_comment(request: Request, comment_id: int):
    """Delete a comment by its ID.

    Args:
        request (Request): The incoming request object (used for rate limiting).
        comment_id (int): ID of the comment to delete.

    Raises:
        HTTPException: If the comment with the specified ID is not found.

    Returns:
        dict: A status message indicating successful deletion.
    """
    logger.info(f"DELETE /comments/{comment_id}")
    comments = load_comments()
    comment_index = next((index for index, c in enumerate(comments) if c["id"] == comment_id), None)

    if comment_index is None:
        logger.warning(f"Comment {comment_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Comment not found")

    del comments[comment_index]
    save_comments(comments)
    logger.info(f"Comment {comment_id} deleted")
    return {"status": "success", "message": "Comment deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    