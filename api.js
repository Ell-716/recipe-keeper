// API Configuration
const API_URL = 'http://localhost:8000';

// API Function: Fetch all recipes (with optional search)
async function fetchRecipes(searchQuery = '') {
    try {
        let url = `${API_URL}/recipes`;
        
        // Add search query parameter if provided
        if (searchQuery && searchQuery.trim() !== '') {
            url += `?search=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
    }
}

// API Function: Create a new recipe
async function createRecipe(recipeData) {
    try {
        const response = await fetch(`${API_URL}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create recipe');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating recipe:', error);
        throw error;
    }
}

// API Function: Update a recipe
async function updateRecipe(recipeId, recipeData) {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update recipe');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw error;
    }
}

// API Function: Delete a recipe
async function deleteRecipe(recipeId) {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete recipe');
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
}