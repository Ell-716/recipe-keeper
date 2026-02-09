// Reference HTML Elements
let recipeForm = document.querySelector('form');
let recipeName = document.getElementById('recipeName');
let ingredients = document.getElementById('ingredients');
let steps = document.getElementById('steps');
let recipeImage = document.getElementById('recipeImage');
let displayArea = document.getElementById('recipeDisplay');
let searchInput = document.getElementById('searchInput');

// Array for Recipes
let recipes = [];

// Track if we're in edit mode
let isEditMode = false;
let editIndex = -1;

// Show error message
function showError(message) {
    displayArea.innerHTML = `<div class="error-message">${message}</div>`;
}

// Show no results message
function showNoResults() {
    displayArea.innerHTML = '<div class="no-results">No recipes found matching your search.</div>';
}

// Load and display recipes
async function loadRecipes() {
    try {
        recipes = await fetchRecipes();
        refreshDisplay();
    } catch (error) {
        showError('Failed to load recipes. Please make sure the API server is running at http://localhost:8000');
    }
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
        handleDeleteRecipe(index);
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
async function handleDeleteRecipe(index) {
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }
    
    try {
        // Get the recipe ID
        let recipe = recipes[index];
        let recipeId = recipe.id;
        
        // Delete via API
        await deleteRecipe(recipeId);
        
        // Refresh recipes from server
        await loadRecipes();
        
        // Show success message
        alert('Recipe deleted successfully!');
    } catch (error) {
        alert('Failed to delete recipe. Please try again.');
    }
}

// Refresh Display Function (helper to redisplay all recipes)
function refreshDisplay() {
    // Get search query
    const searchQuery = searchInput ? searchInput.value : '';
    
    // Filter recipes based on search
    const filteredRecipes = filterRecipes(recipes, searchQuery);
    
    // Clear the display area
    displayArea.innerHTML = '';

    // Check if there are no results
    if (filteredRecipes.length === 0) {
        if (searchQuery) {
            showNoResults();
        } else {
            displayArea.innerHTML = '<div class="no-results">No recipes yet. Add your first recipe!</div>';
        }
        return;
    }

    // Display filtered recipes with their current index
    filteredRecipes.forEach(function(recipe) {
        // Find original index in recipes array
        const originalIndex = recipes.findIndex(r => r.id === recipe.id);
        displayRecipe(recipe, originalIndex);
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
    const validation = validateRecipeData(enteredRecipeName, enteredIngredients, enteredSteps, enteredImageUrl);
    if (!validation.valid) {
        alert(validation.message);
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

    try {
        if (isEditMode) {
            // Update existing recipe via API
            let recipe = recipes[editIndex];
            let recipeId = recipe.id;
            
            await updateRecipe(recipeId, recipeData);
            
            // Refresh recipes from server
            await loadRecipes();
            
            // Show success message
            alert('Recipe updated successfully!');
        } else {
            // Create new recipe via API
            await createRecipe(recipeData);
            
            // Refresh recipes from server
            await loadRecipes();
            
            // Show success message
            alert('Recipe added successfully!');
        }

        // Reset the form
        resetForm();
    } catch (error) {
        alert('Failed to save recipe. Please try again.');
    }
});

// Search Input Event Listener
searchInput.addEventListener('input', function() {
    refreshDisplay();
});

// Load recipes when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
});