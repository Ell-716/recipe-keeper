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

// Validate recipe form data
function validateRecipeData(name, ingredients, steps, imageUrl) {
    if (!name || !ingredients || !steps || !imageUrl) {
        return {
            valid: false,
            message: 'Please fill in all required fields (Recipe Name, Ingredients, Steps and Image URL)'
        };
    }
    
    return { valid: true };
}

// Filter recipes based on search query
function filterRecipes(recipes, searchQuery) {
    if (!searchQuery || searchQuery.trim() === '') {
        return recipes;
    }
    
    const query = searchQuery.toLowerCase();
    
    return recipes.filter(recipe => {
        // Search in recipe name
        const nameMatch = recipe.name.toLowerCase().includes(query);
        
        // Search in ingredients
        const ingredientsMatch = recipe.ingredients.toLowerCase().includes(query);
        
        // Search in steps
        const stepsMatch = recipe.steps.toLowerCase().includes(query);
        
        return nameMatch || ingredientsMatch || stepsMatch;
    });
}