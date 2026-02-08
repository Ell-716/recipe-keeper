// Reference HTML Elements
let recipeForm = document.querySelector('form');
let recipeName = document.getElementById('recipeName');
let ingredients = document.getElementById('ingredients');
let steps = document.getElementById('steps');
let displayArea = document.getElementById('recipeDisplay');

// Array for Recipes
let recipes = [];

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

    // create a delete button
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.classList.add('delete-button');

    // add an event handler, as an inline function
    deleteButton.onclick = function() {
        deleteRecipe(index);
    };

    // append all elements to the recipe div
    recipeDiv.appendChild(nameHeading);
    recipeDiv.appendChild(ingredientsPara);
    recipeDiv.appendChild(stepsPara);
    recipeDiv.appendChild(deleteButton);

    // add the new recipe div to the display area
    displayArea.appendChild(recipeDiv);
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

// Set Up the Event Listener
recipeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Capture Input Values
    let enteredRecipeName = recipeName.value;
    let enteredIngredients = ingredients.value;
    let enteredSteps = steps.value;
    let enteredImageUrl = recipeImage.value;

    // create a new recipe
    let newRecipe = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps,
        imageUrl: enteredImageUrl
    };

    // add the new recipe to the recipes array
    recipes.push(newRecipe);

    // Save to Local Storage
    localStorage.setItem('recipes', JSON.stringify(recipes));

    // Refresh the entire display with updated indices
    refreshDisplay();

    // Clear the Input Fields
    recipeName.value = '';
    ingredients.value = '';
    steps.value = '';
    recipeImage.value = '';
});