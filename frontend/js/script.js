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
let viewButton = document.getElementById('viewButton');
let viewMenu = document.getElementById('viewMenu');
let currentSort = 'name-asc'; // Default sort
let currentView = 'compact'; // Default view
let recipeTags = document.getElementById('recipeTags');

// Array for Recipes
let recipes = [];

// Track if we're in edit mode
let isEditMode = false;
let editIndex = -1;

// Track comment counts for sorting
let commentCounts = {};

/**
 * Displays an error message in the recipe display area
 * @param {string} message - The error message to display
 */
function showError(message) {
    displayArea.innerHTML = `<div class="error-message">${message}</div>`;
}

/**
 * Displays a "no results" message when search returns no recipes
 */
function showNoResults() {
    displayArea.innerHTML = '<div class="no-results">No recipes found matching your search.</div>';
}

/**
 * Shows a toast notification with a message
 * @param {string} message - The message to display in the toast
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    
    // Toast icon
    const icon = document.createElement('span');
    icon.classList.add('toast-icon');
    
    // Toast message
    const content = document.createElement('div');
    content.classList.add('toast-content');
    content.textContent = message;
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('toast-close');
    closeBtn.innerHTML = '×';
    closeBtn.onclick = function() {
        removeToast(toast);
    };
    
    // Assemble toast
    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeBtn);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 9000);
}

/**
 * Removes a toast notification with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

/**
 * Sorts recipes based on the current sort option
 * @param {Array} recipesToSort - Array of recipe objects to sort
 * @returns {Array} Sorted array of recipes
 */
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

/**
 * Loads and displays recipes from the API with optional search filtering
 * @param {string} searchQuery - Optional search query to filter recipes
 */
async function loadRecipes(searchQuery = '') {
    try {
        recipes = await fetchRecipes(searchQuery);
        
        // Store comment counts from API response
        commentCounts = {};
        recipes.forEach(recipe => {
            commentCounts[recipe.id] = recipe.comment_count || 0;
        });
        
        refreshDisplay();
    } catch (error) {
        showError('Failed to load recipes. Please make sure the API server is running at http://localhost:8000');
    }
}

/**
 * Creates a placeholder element for recipes without images
 * @returns {HTMLElement} A div element styled as an image placeholder
 */
function createImagePlaceholder() {
    let placeholder = document.createElement('div');
    placeholder.classList.add('recipe-image-placeholder');

    let icon = document.createElement('div');
    icon.classList.add('icon');
    icon.textContent = '🍴';

    let text = document.createElement('div');
    text.classList.add('text');
    text.textContent = 'No image available';

    placeholder.appendChild(icon);
    placeholder.appendChild(text);

    return placeholder;
}

/**
 * Opens a printer-friendly view of a recipe in a new window
 * @param {Object} recipe - The recipe object to print
 */
function printRecipe(recipe) {
    // Store recipe data in localStorage for the print page to access
    localStorage.setItem('recipeToPrint', JSON.stringify(recipe));

    // Open print page in new window
    window.open('print-recipe.html', '_blank');
}

/**
 * Exports a recipe to PDF and downloads it
 * @param {Object} recipe - The recipe object to export
 */
function exportRecipeToPDF(recipe) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Generate filename
    const filename = recipe.name.toLowerCase().replace(/\s+/g, '-') + '.pdf';

    // Function to add content to PDF
    function addContentToPDF(yPosition) {
        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(74, 124, 89); // #4a7c59
        const titleLines = doc.splitTextToSize(recipe.name, contentWidth);
        doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 10) + 10;

        return yPosition;
    }

    // Function to add ingredients and steps
    function addIngredientsAndSteps(yPosition) {
        // Ingredients heading
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 26, 26); // #1a1a1a
        doc.text('Ingredients', margin, yPosition);
        yPosition += 3;

        // Underline for heading
        doc.setDrawColor(74, 124, 89);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, margin + 40, yPosition);
        yPosition += 10;

        // Ingredients list
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51); // #333

        const ingredientsList = recipe.ingredients.split('\n').filter(item => item.trim() !== '');
        ingredientsList.forEach(ingredient => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = margin;
            }
            const lines = doc.splitTextToSize('• ' + ingredient.trim(), contentWidth - 5);
            doc.text(lines, margin + 5, yPosition);
            yPosition += (lines.length * 6) + 2;
        });

        yPosition += 10;

        // Steps heading
        if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text('Steps', margin, yPosition);
        yPosition += 3;

        // Underline for heading
        doc.setDrawColor(74, 124, 89);
        doc.line(margin, yPosition, margin + 25, yPosition);
        yPosition += 10;

        // Steps list
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);

        const stepsList = recipe.steps.split('\n').filter(item => item.trim() !== '');
        stepsList.forEach((step, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = margin;
            }
            const stepText = (index + 1) + '. ' + step.trim();
            const lines = doc.splitTextToSize(stepText, contentWidth - 5);
            doc.text(lines, margin + 5, yPosition);
            yPosition += (lines.length * 6) + 4;
        });

        // Save the PDF
        doc.save(filename);
    }

    // Start with title
    let yPosition = margin;
    yPosition = addContentToPDF(yPosition);

    // Check if recipe has an image
    if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
        // Load image and add to PDF
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            // Fixed image dimensions for consistent sizing
            const imgWidth = 120;
            const imgHeight = 80;

            // Center the image
            const imgX = (pageWidth - imgWidth) / 2;

            try {
                doc.addImage(img, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 15;
            } catch (e) {
                // If image fails to add, continue without it
                console.log('Could not add image to PDF');
            }

            addIngredientsAndSteps(yPosition);
        };
        img.onerror = function() {
            // If image fails to load, continue without it
            addIngredientsAndSteps(yPosition);
        };
        img.src = recipe.imageUrl;
    } else {
        // No image, just add ingredients and steps
        addIngredientsAndSteps(yPosition);
    }
}

/**
 * Routes recipe display to the appropriate view function based on current view mode
 * @param {Object} recipe - The recipe object to display
 * @param {number} index - The index of the recipe in the recipes array
 */
async function displayRecipe(recipe, index) {
    if (currentView === 'list') {
        displayRecipeList(recipe, index);
    } else if (currentView === 'compact') {
        displayRecipeCompact(recipe, index);
    } else {
        displayRecipeGrid(recipe, index);
    }
}

/**
 * Displays a recipe in grid view (full card with all details visible)
 * @param {Object} recipe - The recipe object to display
 * @param {number} index - The index of the recipe in the recipes array
 */
function displayRecipeGrid(recipe, index) {
    let recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe-card');

    let nameHeading = document.createElement('h3');
    nameHeading.textContent = recipe.name;
    recipeDiv.appendChild(nameHeading);

    if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
        let recipeImg = document.createElement('img');
        recipeImg.src = recipe.imageUrl;
        recipeImg.alt = recipe.name;
        recipeDiv.appendChild(recipeImg);
    } else {
        let placeholder = createImagePlaceholder();
        recipeDiv.appendChild(placeholder);
    }

    let ingredientsPara = document.createElement('div');
    ingredientsPara.innerHTML = formatIngredientsList(recipe.ingredients);
    recipeDiv.appendChild(ingredientsPara);

    let stepsPara = document.createElement('div');
    stepsPara.innerHTML = formatStepsList(recipe.steps);
    recipeDiv.appendChild(stepsPara);

    // Add tags if they exist (at bottom)
    if (recipe.tags && recipe.tags.length > 0) {
        let tagBadges = createTagBadges(recipe.tags);
        recipeDiv.appendChild(tagBadges);
    }

    let actionIcons = createActionIcons(recipe, index);
    recipeDiv.appendChild(actionIcons);

    displayArea.appendChild(recipeDiv);
}

/**
 * Displays a recipe in compact view (small cards that expand on click)
 * @param {Object} recipe - The recipe object to display
 * @param {number} index - The index of the recipe in the recipes array
 */
function displayRecipeCompact(recipe, index) {
    let recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe-card');

    // Card content (always visible - image and name)
    let cardPreview = document.createElement('div');
    cardPreview.classList.add('recipe-preview');
    cardPreview.style.cursor = 'pointer';

    if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
        let recipeImg = document.createElement('img');
        recipeImg.src = recipe.imageUrl;
        recipeImg.alt = recipe.name;
        cardPreview.appendChild(recipeImg);
    } else {
        let placeholder = createImagePlaceholder();
        cardPreview.appendChild(placeholder);
    }

    let nameHeading = document.createElement('h3');
    nameHeading.textContent = recipe.name;
    cardPreview.appendChild(nameHeading);

    // Recipe details (collapsible)
    let recipeDetails = document.createElement('div');
    recipeDetails.classList.add('recipe-details');

    let ingredientsPara = document.createElement('div');
    ingredientsPara.innerHTML = formatIngredientsList(recipe.ingredients);
    recipeDetails.appendChild(ingredientsPara);

    let stepsPara = document.createElement('div');
    stepsPara.innerHTML = formatStepsList(recipe.steps);
    recipeDetails.appendChild(stepsPara);

    // Add tags if they exist (at bottom)
    if (recipe.tags && recipe.tags.length > 0) {
        let tagBadges = createTagBadges(recipe.tags);
        recipeDetails.appendChild(tagBadges);
    }

    let actionIcons = createActionIcons(recipe, index);
    recipeDetails.appendChild(actionIcons);

    // Toggle expand/collapse on click
    cardPreview.onclick = function() {
        recipeDiv.classList.toggle('expanded');
    };

    recipeDiv.appendChild(cardPreview);
    recipeDiv.appendChild(recipeDetails);

    displayArea.appendChild(recipeDiv);
}

/**
 * Displays a recipe in list view (accordion/collapsible style)
 * @param {Object} recipe - The recipe object to display
 * @param {number} index - The index of the recipe in the recipes array
 */
function displayRecipeList(recipe, index) {
    let recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe-card');

    // Recipe header (always visible)
    let recipeHeader = document.createElement('div');
    recipeHeader.classList.add('recipe-header');

    let nameHeading = document.createElement('h3');
    nameHeading.textContent = recipe.name;

    let expandIcon = document.createElement('span');
    expandIcon.classList.add('recipe-expand-icon');
    expandIcon.textContent = '▼';

    recipeHeader.appendChild(nameHeading);
    recipeHeader.appendChild(expandIcon);

    // Recipe content (collapsible)
    let recipeContent = document.createElement('div');
    recipeContent.classList.add('recipe-content');

    if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
        let recipeImg = document.createElement('img');
        recipeImg.src = recipe.imageUrl;
        recipeImg.alt = recipe.name;
        recipeContent.appendChild(recipeImg);
    } else {
        let placeholder = createImagePlaceholder();
        recipeContent.appendChild(placeholder);
    }

    let ingredientsPara = document.createElement('div');
    ingredientsPara.innerHTML = formatIngredientsList(recipe.ingredients);
    recipeContent.appendChild(ingredientsPara);

    let stepsPara = document.createElement('div');
    stepsPara.innerHTML = formatStepsList(recipe.steps);
    recipeContent.appendChild(stepsPara);

    // Add tags if they exist (at bottom)
    if (recipe.tags && recipe.tags.length > 0) {
        let tagBadges = createTagBadges(recipe.tags);
        recipeContent.appendChild(tagBadges);
    }

    let actionIcons = createActionIcons(recipe, index);
    recipeContent.appendChild(actionIcons);

    // Toggle expand/collapse
    recipeHeader.onclick = function() {
        recipeDiv.classList.toggle('expanded');
    };

    recipeDiv.appendChild(recipeHeader);
    recipeDiv.appendChild(recipeContent);

    displayArea.appendChild(recipeDiv);
}

/**
 * Helper function to create action icons for a recipe card
 * @param {Object} recipe - The recipe object
 * @param {number} index - The index of the recipe in the recipes array
 * @returns {HTMLElement} A div element containing action buttons
 */
function createActionIcons(recipe, index) {
    let actionIcons = document.createElement('div');
    actionIcons.classList.add('action-icons');

    // Edit icon
    let editIcon = document.createElement('button');
    editIcon.classList.add('icon-button', 'edit-icon');
    editIcon.innerHTML = '<img src="assets/edit-text.png" alt="Edit" style="width: 24px; height: 24px;">';
    editIcon.title = 'Edit recipe';
    editIcon.onclick = function() {
        editRecipe(index);
    };

    // Delete icon
    let deleteIcon = document.createElement('button');
    deleteIcon.classList.add('icon-button', 'delete-icon');
    deleteIcon.innerHTML = '<img src="assets/bin.png" alt="Delete" style="width: 24px; height: 24px;">';
    deleteIcon.title = 'Delete recipe';
    deleteIcon.onclick = function() {
        handleDeleteRecipe(index);
    };

    // Comment icon with count
    let commentIconContainer = document.createElement('button');
    commentIconContainer.classList.add('icon-button', 'comment-icon');
    commentIconContainer.innerHTML = '<img src="assets/chat.png" alt="Comments" style="width: 24px; height: 24px;">';
    commentIconContainer.title = 'View comments';

    const commentCount = recipe.comment_count || 0;
    if (commentCount > 0) {
        let commentCountBadge = document.createElement('span');
        commentCountBadge.classList.add('comment-count');
        commentCountBadge.textContent = commentCount;
        commentIconContainer.appendChild(commentCountBadge);
    }

    commentIconContainer.onclick = function() {
        openCommentsModal(recipe.id, recipe.name);
    };

    // Print icon
    let printIcon = document.createElement('button');
    printIcon.classList.add('icon-button', 'print-icon');
    printIcon.innerHTML = '<img src="assets/print.png" alt="Print" style="width: 24px; height: 24px;">';
    printIcon.title = 'Print recipe';
    printIcon.onclick = function() {
        printRecipe(recipe);
    };

    // Download PDF icon
    let downloadIcon = document.createElement('button');
    downloadIcon.classList.add('icon-button', 'download-icon');
    downloadIcon.innerHTML = '<img src="assets/download.png" alt="Download PDF" style="width: 24px; height: 24px;">';
    downloadIcon.title = 'Download as PDF';
    downloadIcon.onclick = function() {
        exportRecipeToPDF(recipe);
    };

    actionIcons.appendChild(editIcon);
    actionIcons.appendChild(deleteIcon);
    actionIcons.appendChild(commentIconContainer);
    actionIcons.appendChild(printIcon);
    actionIcons.appendChild(downloadIcon);

    return actionIcons;
}

/**
 * Creates colored tag badges for a recipe
 * @param {Array} tags - Array of tag strings
 * @returns {HTMLElement} A div element containing tag badges
 */
function createTagBadges(tags) {
    if (!tags || tags.length === 0) return '';
    
    let tagsContainer = document.createElement('div');
    tagsContainer.classList.add('recipe-tags');
    
    tags.forEach(tag => {
        let tagBadge = document.createElement('span');
        tagBadge.classList.add('recipe-tag');
        
        // Add specific class based on tag name (lowercase, no spaces)
        let tagClass = 'tag-' + tag.toLowerCase().replace(/\s+/g, '');
        
        // Check if this is a recognized tag category, otherwise use default
        const recognizedTags = [
            'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer',
            'vegan', 'vegetarian', 'glutenfree', 'dairyfree', 'keto', 'paleo',
            'quick', 'easy', 'healthy', 'comfort', 'spicy', 'sweet'
        ];
        
        if (recognizedTags.includes(tag.toLowerCase().replace(/\s+/g, ''))) {
            tagBadge.classList.add(tagClass);
        } else {
            tagBadge.classList.add('tag-default');
        }
        
        tagBadge.textContent = tag;
        tagsContainer.appendChild(tagBadge);
    });
    
    return tagsContainer;
}

/**
 * Opens a modal dialog for viewing and adding comments to a recipe
 * @param {number} recipeId - The ID of the recipe
 * @param {string} recipeName - The name of the recipe
 */
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

/**
 * Closes the comments modal and refreshes the recipe display
 * @param {HTMLElement} modal - The modal element to close
 */
function closeCommentsModal(modal) {
    modal.remove();
    // Refresh the recipe display to update comment counts
    loadRecipes(searchInput.value);
}

/**
 * Loads and displays comments for a recipe in the modal
 * @param {number} recipeId - The ID of the recipe
 * @param {HTMLElement} commentsList - The container element for comments
 */
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
            deleteBtn.innerHTML = '<img src="assets/bin.png" alt="Delete" style="width: 18px; height: 18px;">';
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

/**
 * Handles adding a new comment to a recipe
 * @param {number} recipeId - The ID of the recipe
 * @param {HTMLInputElement} authorInput - The input element for author name
 * @param {HTMLTextAreaElement} commentTextarea - The textarea element for comment text
 * @param {HTMLElement} modal - The modal element
 */
async function handleAddComment(recipeId, authorInput, commentTextarea, modal) {
    const author = authorInput.value.trim();
    const text = commentTextarea.value.trim();

    if (!author || !text) {
        showToast('Please enter your name and a comment.', 'warning');
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

        showToast('Comment added successfully!', 'success');
    } catch (error) {
        showToast('Failed to add comment. Please try again.', 'error');
    }
}

/**
 * Handles deleting a comment from a recipe
 * @param {number} commentId - The ID of the comment to delete
 * @param {number} recipeId - The ID of the recipe
 * @param {HTMLElement} commentsList - The container element for comments
 */
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

        showToast('Comment deleted successfully!', 'success');
    } catch (error) {
        showToast('Failed to delete comment. Please try again.', 'error');
    }
}

/**
 * Populates the form with recipe data for editing
 * @param {number} index - The index of the recipe to edit in the recipes array
 */
function editRecipe(index) {
    // Get the recipe to edit
    let recipe = recipes[index];

    // Populate the form with existing data
    recipeName.value = recipe.name;
    ingredients.value = recipe.ingredients;
    steps.value = recipe.steps;
    recipeImage.value = recipe.imageUrl || '';
    recipeTags.value = recipe.tags ? recipe.tags.join(', ') : '';

    // Set edit mode
    isEditMode = true;
    editIndex = index;

    // Change button text to indicate editing
    let submitButton = document.querySelector('button[type="submit"]');
    
    submitButton.textContent = "Update Recipe";

    // Scroll to form
    recipeForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Handles deleting a recipe after user confirmation
 * @param {number} index - The index of the recipe to delete in the recipes array
 */
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
        showToast('Recipe deleted successfully!', 'success');
    } catch (error) {
        showToast('Failed to delete recipe. Please try again.', 'error');
    }
}

/**
 * Refreshes the recipe display area with sorted recipes in the current view mode
 */
async function refreshDisplay() {
    // Update view class
    displayArea.className = `${currentView}-view`;
    
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
        const originalIndex = recipes.findIndex(r => r.id === sortedRecipes[i].id);
        await displayRecipe(sortedRecipes[i], originalIndex);
    }
}

/**
 * Resets the recipe form to its default state
 */
function resetForm() {
    recipeName.value = '';
    ingredients.value = '';
    steps.value = '';
    recipeImage.value = '';
    recipeTags.value = '';
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
    let enteredTags = recipeTags.value.trim();

    // Validation
    const validation = validateRecipeData(enteredRecipeName, enteredIngredients, enteredSteps);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }

    // Capitalize recipe name
    enteredRecipeName = capitalizeRecipeName(enteredRecipeName);

    // Parse tags (split by comma and trim)
    let tagsArray = enteredTags ? enteredTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Prepare recipe data
    const recipeData = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps,
        imageUrl: enteredImageUrl,
        tags: tagsArray
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
            showToast('Recipe updated successfully!', 'success');
        } else {
            // Create new recipe via API
            await createRecipe(recipeData);

            // Refresh recipes from server (clear search)
            searchInput.value = '';
            await loadRecipes();

            // Show success message
            showToast('Recipe added successfully!', 'success');
        }

        // Reset the form
        resetForm();
    } catch (error) {
        showToast('Failed to save recipe. Please try again.', 'error');
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

// Sort Button and Menu Event Listeners
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

// View Button and Menu Event Listeners
viewButton.addEventListener('click', function(e) {
    e.stopPropagation();
    viewMenu.style.display = viewMenu.style.display === 'none' ? 'block' : 'none';
});

// Close view menu when clicking outside
document.addEventListener('click', function(e) {
    if (!viewButton.contains(e.target) && !viewMenu.contains(e.target)) {
        viewMenu.style.display = 'none';
    }
});

// Handle view option clicks
document.querySelectorAll('.view-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove active class from all options
        document.querySelectorAll('.view-option').forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        this.classList.add('active');
        
        // Update current view
        currentView = this.getAttribute('data-view');
        
        // Hide menu
        viewMenu.style.display = 'none';
        
        // Refresh display with new view
        refreshDisplay();
    });
});

// Load recipes when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
});
