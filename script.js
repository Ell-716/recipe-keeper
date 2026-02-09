// Reference HTML Elements
let recipeForm = document.querySelector('form');
let recipeName = document.getElementById('recipeName');
let ingredients = document.getElementById('ingredients');
let steps = document.getElementById('steps');
let recipeImage = document.getElementById('recipeImage');
let displayArea = document.getElementById('recipeDisplay');

// API Configuration
const API_URL = 'http://localhost:8000';

// Array for Recipes
let recipes = [];

// Track if we're in edit mode
let isEditMode = false;
let editIndex = -1;

// API Function: Fetch all recipes
async function fetchRecipes() {
    try {
        const response = await fetch(`${API_URL}/recipes`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        recipes = data;
        refreshDisplay();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('Failed to load recipes. Please make sure the API server is running at http://localhost:8000');
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
        
        const newRecipe = await response.json();
        
        // Refresh recipes from server
        await fetchRecipes();
        
        return newRecipe;
    } catch (error) {
        console.error('Error creating recipe:', error);
        alert('Failed to add recipe. Please try again.');
        return null;
    }
}

// API Function: Delete a recipe
async function deleteRecipeAPI(recipeId) {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete recipe');
        }
        
        // Refresh recipes from server
        await fetchRecipes();
        
        return true;
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
        return false;
    }
}

// API Function: Update a recipe
async function updateRecipeAPI(recipeId, recipeData) {
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
        
        // Refresh recipes from server
        await fetchRecipes();
        
        return await response.json();
    } catch (error) {
        console.error('Error updating recipe:', error);
        alert('Failed to update recipe. Please try again.');
        return null;
    }
}

// Function to capitalize recipe name
function capitalizeRecipeName(name) {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to format ingredients as list
function formatIngredientsList(ingredientsText) {
    // Split by commas or newlines
    let ingredientsArray = ingredientsText
        .split(/[,\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    
    // Create HTML list
    let listHTML = '<strong>Ingredients:</strong><ul>';
    ingredientsArray.forEach(ingredient => {
        listHTML += '<li>' + ingredient + '</li>';
    });
    listHTML += '</ul>';
    
    return listHTML;
}

// Function to format steps as numbered list
function formatStepsList(stepsText) {
    // Split by newlines or numbered patterns
    let stepsArray = stepsText
        .split(/\n/)
        .map(item => item.trim())
        .map(item => item.replace(/^\d+\.\s*/, '')) // Remove existing numbers
        .filter(item => item.length > 0);
    
    // Create HTML numbered list
    let listHTML = '<strong>Steps:</strong><ol>';
    stepsArray.forEach(step => {
        listHTML += '<li>' + step + '</li>';
    });
    listHTML += '</ol>';
    
    return listHTML;
}

// Display Function
function displayRecipe(recipe, index) {
    // create a div for the new recipe
    let recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe-card');

    // create recipe name heading
    let nameHeading = document.createElement('h3');
    nameHeading.textContent = recipe.name;

    // create and display image if URL is provided
    if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
        let recipeImg = document.createElement('img');
        recipeImg.src = recipe.imageUrl;
        recipeImg.alt = recipe.name;
        recipeDiv.appendChild(recipeImg);
    }

    // create ingredients list
    let ingredientsPara = document.createElement('div');
    ingredientsPara.innerHTML = formatIngredientsList(recipe.ingredients);

    // create steps list
    let stepsPara = document.createElement('div');
    stepsPara.innerHTML = formatStepsList(recipe.steps);

    // create button container
    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // create an edit button
    let editButton = document.createElement('button');
    editButton.textContent = "Edit";
    editButton.classList.add('edit-button');

    // add an event handler for edit
    editButton.onclick = function() {
        editRecipe(index);
    };

    // create a delete button
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.classList.add('delete-button');

    // add an event handler for delete
    deleteButton.onclick = function() {
        deleteRecipe(index);
    };

    // append buttons to container
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    // append all elements to the recipe div
    recipeDiv.appendChild(nameHeading);
    recipeDiv.appendChild(ingredientsPara);
    recipeDiv.appendChild(stepsPara);
    recipeDiv.appendChild(buttonContainer);

    // add the new recipe div to the display area
    displayArea.appendChild(recipeDiv);
}

// Edit Function
function editRecipe(index) {
    // Get the recipe to edit
    let recipe = recipes[index];

    // Populate the form with existing data
    recipeName.value = recipe.name;
    ingredients.value = recipe.ingredients;
    steps.value = recipe.steps;
    recipeImage.value = recipe.imageUrl || '';

    // Set edit mode
    isEditMode = true;
    editIndex = index;

    // Change button text to indicate editing
    let submitButton = document.querySelector('button[type="submit"]');
    submitButton.textContent = "Update Recipe";

    // Scroll to form
    recipeForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete Function
async function deleteRecipe(index) {
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }
    
    // Get the recipe ID
    let recipe = recipes[index];
    let recipeId = recipe.id;
    
    // Delete via API
    await deleteRecipeAPI(recipeId);
}

// Refresh Display Function (helper to redisplay all recipes)
function refreshDisplay() {
    // Clear the display area
    displayArea.innerHTML = '';

    // Display all recipes with their current index
    recipes.forEach(function(recipe, index) {
        displayRecipe(recipe, index);
    });
}

// Reset Form Function
function resetForm() {
    recipeName.value = '';
    ingredients.value = '';
    steps.value = '';
    recipeImage.value = '';
    isEditMode = false;
    editIndex = -1;

    // Reset button text
    let submitButton = document.querySelector('button[type="submit"]');
    submitButton.textContent = "Add Recipe";
}

// Set Up the Event Listener
recipeForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Capture Input Values
    let enteredRecipeName = recipeName.value.trim();
    let enteredIngredients = ingredients.value.trim();
    let enteredSteps = steps.value.trim();
    let enteredImageUrl = recipeImage.value.trim();

    // Validation
    if (!enteredRecipeName || !enteredIngredients || !enteredSteps || !enteredImageUrl) {
        alert('Please fill in all required fields (Recipe Name, Ingredients, Steps and Image URL)');
        return;
    }

    // Capitalize recipe name
    enteredRecipeName = capitalizeRecipeName(enteredRecipeName);

    // Prepare recipe data
    const recipeData = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps,
        imageUrl: enteredImageUrl
    };

    if (isEditMode) {
        // Update existing recipe via API
        let recipe = recipes[editIndex];
        let recipeId = recipe.id;
        
        await updateRecipeAPI(recipeId, recipeData);
    } else {
        // Create new recipe via API
        await createRecipe(recipeData);
    }

    // Reset the form
    resetForm();
});

// Load recipes when page loads
window.addEventListener('DOMContentLoaded', function() {
    fetchRecipes();
});