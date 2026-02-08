// Reference HTML Elements
let recipeForm = document.querySelector('form');
let recipeName = document.getElementById('recipeName');
let ingredients = document.getElementById('ingredients');
let steps = document.getElementById('steps');
let displayArea = document.getElementById('recipeDisplay');

// Array for Recipes
let recipes = [];

// Set Up the Event Listener
recipeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Capture Input Values
    let enteredRecipeName = recipeName.value;
    let enteredIngredients = ingredients.value;
    let enteredSteps = steps.value;

    // create a new recipe
    let newRecipe = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps
    };

    // add the new recipe to the recipes array
    recipes.push(newRecipe);

    // Clear the Input Fields
    recipeName.value = '';
    ingredients.value = '';
    steps.value = '';

});