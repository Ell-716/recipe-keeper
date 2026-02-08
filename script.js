// Reference HTML Elements
let recipeForm = document.querySelector('form');
let recipeName = document.getElementById('recipeName');
let ingredients = document.getElementById('ingredients');
let steps = document.getElementById('steps');
let recipeImage = document.getElementById('recipeImage');
let displayArea = document.getElementById('recipeDisplay');

// Array for Recipes
let recipes = [];

// Track if we're in edit mode
let isEditMode = false;
let editIndex = -1;

// Load from Local Storage on page load
if (localStorage.getItem('recipes')) {
    recipes = JSON.parse(localStorage.getItem('recipes'));
    // Display the loaded recipes on the page
    refreshDisplay();
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

    // create ingredients paragraph
    let ingredientsPara = document.createElement('p');
    ingredientsPara.innerHTML = '<strong>Ingredients:</strong> ' + recipe.ingredients;

    // create steps paragraph
    let stepsPara = document.createElement('p');
    stepsPara.innerHTML = '<strong>Steps:</strong><br>' + recipe.steps;

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
function deleteRecipe(index) {
    // Remove recipe from the array recipes
    recipes.splice(index, 1);

    // Save to Local Storage
    localStorage.setItem('recipes', JSON.stringify(recipes));

    // Refresh the Display
    refreshDisplay();
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
recipeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Capture Input Values
    let enteredRecipeName = recipeName.value.trim();
    let enteredIngredients = ingredients.value.trim();
    let enteredSteps = steps.value.trim();
    let enteredImageUrl = recipeImage.value.trim();

    // Validation
    if (!enteredRecipeName || !enteredIngredients || !enteredSteps) {
        alert('Please fill in all required fields (Recipe Name, Ingredients, and Steps)');
        return;
    }

    if (isEditMode) {
        // Update existing recipe
        recipes[editIndex] = {
            name: enteredRecipeName,
            ingredients: enteredIngredients,
            steps: enteredSteps,
            imageUrl: enteredImageUrl
        };

        console.log('Recipe updated:', recipes[editIndex]);
    } else {
        // Create new recipe
        let newRecipe = {
            name: enteredRecipeName,
            ingredients: enteredIngredients,
            steps: enteredSteps,
            imageUrl: enteredImageUrl
        };

        // add the new recipe to the recipes array
        recipes.push(newRecipe);

        console.log('Recipe added:', newRecipe);
    }

    // Save to Local Storage
    localStorage.setItem('recipes', JSON.stringify(recipes));

    // Refresh the entire display with updated indices
    refreshDisplay();

    // Reset the form
    resetForm();
});