// Reference HTML Elements
let recipeForm = document.querySelector('form');
let recipeName = document.getElementById('recipeName');
let ingredients = document.getElementById('ingredients');
let steps = document.getElementById('steps');
let recipeImage = document.getElementById('recipeImage');
let displayArea = document.getElementById('recipeDisplay');
let searchInput = document.getElementById('searchInput');
let sortButton = document.getElementById('sortButton');
let sortMenu = document.getElementById('sortMenu');
let currentSort = 'name-asc';

// Array for Recipes
let recipes = [];

// Track if we're in edit mode
let isEditMode = false;
let editIndex = -1;

// Track comment counts for sorting
let commentCounts = {};

// Show error message
function showError(message) {
    displayArea.innerHTML = `<div class="error-message">${message}</div>`;
}

// Show no results message
function showNoResults() {
    displayArea.innerHTML = '<div class="no-results">No recipes found matching your search.</div>';
}

// Sort recipes based on selected option
function sortRecipes(recipesToSort) {
    const sortOption = currentSort;
    let sorted = [...recipesToSort]; // Create a copy
    
    switch(sortOption) {
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-newest':
            sorted.sort((a, b) => b.id - a.id);
            break;
        case 'date-oldest':
            sorted.sort((a, b) => a.id - b.id);
            break;
        case 'comments-most':
            sorted.sort((a, b) => {
                const aCount = commentCounts[a.id] || 0;
                const bCount = commentCounts[b.id] || 0;
                return bCount - aCount;
            });
            break;
    }
    
    return sorted;
}

// Load and display recipes (with optional search)
async function loadRecipes(searchQuery = '') {
    try {
        recipes = await fetchRecipes(searchQuery);
        
        // Load comment counts for all recipes
        await loadAllCommentCounts();
        
        refreshDisplay();
    } catch (error) {
        showError('Failed to load recipes. Please make sure the API server is running at http://localhost:8000');
    }
}

// Load comment counts for all recipes
async function loadAllCommentCounts() {
    commentCounts = {};
    for (let recipe of recipes) {
        try {
            const comments = await getComments(recipe.id);
            commentCounts[recipe.id] = comments.length;
        } catch (error) {
            commentCounts[recipe.id] = 0;
        }
    }
}

// Display Function
async function displayRecipe(recipe, index) {
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

    // append elements to recipe div
    recipeDiv.appendChild(nameHeading);
    recipeDiv.appendChild(ingredientsPara);
    recipeDiv.appendChild(stepsPara);

    // Create action icons container
    let actionIcons = document.createElement('div');
    actionIcons.classList.add('action-icons');

    // Edit icon
    let editIcon = document.createElement('button');
    editIcon.classList.add('icon-button', 'edit-icon');
    editIcon.innerHTML = '<img src="edit-text.png" alt="Edit" style="width: 24px; height: 24px;">';
    editIcon.title = 'Edit recipe';
    editIcon.onclick = function() {
        editRecipe(index);
    };

    // Delete icon
    let deleteIcon = document.createElement('button');
    deleteIcon.classList.add('icon-button', 'delete-icon');
    deleteIcon.innerHTML = '<img src="bin.png" alt="Delete" style="width: 24px; height: 24px;">';
    deleteIcon.title = 'Delete recipe';
    deleteIcon.onclick = function() {
        handleDeleteRecipe(index);
    };

    // Comment icon with count
    let commentIconContainer = document.createElement('button');
    commentIconContainer.classList.add('icon-button', 'comment-icon');
    commentIconContainer.innerHTML = '<img src="chat.png" alt="Comments" style="width: 24px; height: 24px;">';
    commentIconContainer.title = 'View comments';
    
    // Use cached comment count
    const commentCount = commentCounts[recipe.id] || 0;
    if (commentCount > 0) {
        let commentCountBadge = document.createElement('span');
        commentCountBadge.classList.add('comment-count');
        commentCountBadge.textContent = commentCount;
        commentIconContainer.appendChild(commentCountBadge);
    }
    
    commentIconContainer.onclick = function() {
        openCommentsModal(recipe.id, recipe.name);
    };

    // Append icons
    actionIcons.appendChild(editIcon);
    actionIcons.appendChild(deleteIcon);
    actionIcons.appendChild(commentIconContainer);

    recipeDiv.appendChild(actionIcons);

    // add the new recipe div to the display area
    displayArea.appendChild(recipeDiv);
}

// Open comments modal
async function openCommentsModal(recipeId, recipeName) {
    // Create modal overlay
    let modal = document.createElement('div');
    modal.classList.add('comments-modal');
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeCommentsModal(modal);
        }
    };

    // Create modal content
    let modalContent = document.createElement('div');
    modalContent.classList.add('comments-modal-content');

    // Modal header
    let modalHeader = document.createElement('div');
    modalHeader.classList.add('comments-modal-header');
    
    let title = document.createElement('h3');
    title.textContent = `Comments - ${recipeName}`;
    
    let closeBtn = document.createElement('button');
    closeBtn.classList.add('close-modal');
    closeBtn.innerHTML = '×';
    closeBtn.onclick = function() {
        closeCommentsModal(modal);
    };

    modalHeader.appendChild(title);
    modalHeader.appendChild(closeBtn);
    modalContent.appendChild(modalHeader);

    // Comment form
    let commentForm = document.createElement('div');
    commentForm.classList.add('comment-form');

    let authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.placeholder = 'Your name';
    authorInput.id = `author-${recipeId}`;

    let commentTextarea = document.createElement('textarea');
    commentTextarea.placeholder = 'Write a comment...';
    commentTextarea.id = `comment-${recipeId}`;

    let submitButton = document.createElement('button');
    submitButton.textContent = 'Add Comment';
    submitButton.onclick = async function() {
        await handleAddComment(recipeId, authorInput, commentTextarea, modal);
    };

    commentForm.appendChild(authorInput);
    commentForm.appendChild(commentTextarea);
    commentForm.appendChild(submitButton);
    modalContent.appendChild(commentForm);

    // Comments list
    let commentsList = document.createElement('div');
    commentsList.classList.add('comments-list');
    commentsList.id = `modal-comments-list-${recipeId}`;

    // Load comments
    await loadCommentsInModal(recipeId, commentsList);

    modalContent.appendChild(commentsList);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Close comments modal
function closeCommentsModal(modal) {
    modal.remove();
    // Refresh the recipe display to update comment counts
    loadRecipes(searchInput.value);
}

// Load comments in modal
async function loadCommentsInModal(recipeId, commentsList) {
    try {
        const comments = await getComments(recipeId);
        
        commentsList.innerHTML = '';

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }

        comments.forEach(comment => {
            let commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');

            let commentHeader = document.createElement('div');
            commentHeader.classList.add('comment-header');

            let authorDiv = document.createElement('div');
            authorDiv.classList.add('comment-author');
            authorDiv.textContent = comment.author;

            let deleteBtn = document.createElement('button');
            deleteBtn.classList.add('comment-delete-icon');
            deleteBtn.innerHTML = '<img src="bin.png" alt="Delete" style="width: 18px; height: 18px;">';
            deleteBtn.title = 'Delete comment';
            deleteBtn.onclick = async function() {
                await handleDeleteComment(comment.id, recipeId, commentsList);
            };

            commentHeader.appendChild(authorDiv);
            commentHeader.appendChild(deleteBtn);

            let textDiv = document.createElement('div');
            textDiv.classList.add('comment-text');
            textDiv.textContent = comment.text;

            commentItem.appendChild(commentHeader);
            commentItem.appendChild(textDiv);

            commentsList.appendChild(commentItem);
        });
    } catch (error) {
        commentsList.innerHTML = '<p class="no-comments">Failed to load comments.</p>';
    }
}

// Handle adding a comment
async function handleAddComment(recipeId, authorInput, commentTextarea, modal) {
    const author = authorInput.value.trim();
    const text = commentTextarea.value.trim();

    if (!author || !text) {
        alert('Please enter your name and a comment.');
        return;
    }

    try {
        const commentData = {
            recipe_id: recipeId,
            author: author,
            text: text
        };

        await addComment(recipeId, commentData);

        // Clear inputs
        authorInput.value = '';
        commentTextarea.value = '';

        // Reload comments
        const commentsList = document.getElementById(`modal-comments-list-${recipeId}`);
        await loadCommentsInModal(recipeId, commentsList);

        // Update comment count
        commentCounts[recipeId] = (commentCounts[recipeId] || 0) + 1;

        alert('Comment added successfully!');
    } catch (error) {
        alert('Failed to add comment. Please try again.');
    }
}

// Handle deleting a comment
async function handleDeleteComment(commentId, recipeId, commentsList) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    try {
        await deleteComment(commentId);

        // Reload comments
        await loadCommentsInModal(recipeId, commentsList);

        // Update comment count
        commentCounts[recipeId] = Math.max((commentCounts[recipeId] || 1) - 1, 0);

        alert('Comment deleted successfully!');
    } catch (error) {
        alert('Failed to delete comment. Please try again.');
    }
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
        
        // Refresh recipes from server with current search query
        const searchQuery = searchInput.value;
        await loadRecipes(searchQuery);
        
        // Show success message
        alert('Recipe deleted successfully!');
    } catch (error) {
        alert('Failed to delete recipe. Please try again.');
    }
}

// Refresh Display Function (helper to redisplay all recipes)
async function refreshDisplay() {
    // Clear the display area
    displayArea.innerHTML = '';

    // Check if there are no results
    if (recipes.length === 0) {
        const searchQuery = searchInput ? searchInput.value : '';
        if (searchQuery) {
            showNoResults();
        } else {
            displayArea.innerHTML = '<div class="no-results">No recipes yet. Add your first recipe!</div>';
        }
        return;
    }

    // Sort recipes
    const sortedRecipes = sortRecipes(recipes);

    // Display sorted recipes
    for (let i = 0; i < sortedRecipes.length; i++) {
        // Find original index for edit/delete operations
        const originalIndex = recipes.findIndex(r => r.id === sortedRecipes[i].id);
        await displayRecipe(sortedRecipes[i], originalIndex);
    }
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
            
            // Refresh recipes from server with current search query
            const searchQuery = searchInput.value;
            await loadRecipes(searchQuery);
            
            // Show success message
            alert('Recipe updated successfully!');
        } else {
            // Create new recipe via API
            await createRecipe(recipeData);
            
            // Refresh recipes from server (clear search)
            searchInput.value = '';
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

// Search Input Event Listener - now uses backend search
let searchTimeout;
searchInput.addEventListener('input', function() {
    // Debounce search to avoid too many API calls
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchQuery = searchInput.value;
        loadRecipes(searchQuery);
    }, 300); // Wait 300ms after user stops typing
});

/// Sort Button and Menu Event Listeners
sortButton.addEventListener('click', function(e) {
    e.stopPropagation();
    sortMenu.style.display = sortMenu.style.display === 'none' ? 'block' : 'none';
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    if (!sortButton.contains(e.target) && !sortMenu.contains(e.target)) {
        sortMenu.style.display = 'none';
    }
});

// Handle sort option clicks
document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove active class from all options
        document.querySelectorAll('.sort-option').forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        this.classList.add('active');
        
        // Update current sort
        currentSort = this.getAttribute('data-sort');
        
        // Hide menu
        sortMenu.style.display = 'none';
        
        // Refresh display with new sort
        refreshDisplay();
    });
});

// Load recipes when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
});