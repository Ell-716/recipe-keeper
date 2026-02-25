# Recipe Keeper 🍳

A full-stack web application for storing and managing your favorite recipes with search, sorting, and commenting features.

## Features ✨

- **CRUD Operations**: Create, Read, Update, and Delete recipes
- **Tag System**: Organize recipes with color-coded tags (e.g., Breakfast, Vegan, Quick, Healthy)
  - 18 pre-styled tag categories with custom colors
  - Tags displayed at the bottom of recipe cards
  - Support for custom tags with default styling
- **Multiple View Modes**: Switch between Compact (default), Grid, and List views
  - **Compact View**: Grid of recipe cards with images - click to expand for full details
  - **Grid View**: Full detailed recipe cards with all information visible
  - **List View**: Accordion-style list - click recipe names to expand/collapse
- **Search Functionality**: Real-time search across recipe names, ingredients, and steps
- **Advanced Sorting**: Sort recipes by name (A-Z, Z-A), date added (newest/oldest), or number of comments
- **Comment System**: Add and delete comments on recipes with a modal interface
- **Responsive Design**: Clean, professional UI with background imagery
- **Icon-based Actions**: Intuitive edit, delete, and comment icons
- **Recipe Display**: Beautiful recipe cards with images, formatted ingredients, and step-by-step instructions

## Tech Stack 🛠️

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **JSON**: File-based storage

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with custom design
- **Vanilla JavaScript**: Dynamic functionality
- **Fetch API**: HTTP requests

## Project Structure 📁
```
recipe-keeper/
├── backend/
│   ├── api.py              # FastAPI application
│   ├── recipes.json        # Recipe data storage
│   └── comments.json       # Comments data storage
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # Styles
│   ├── js/
│   │   ├── api.js          # API functions
│   │   ├── validators.js   # Validation & formatting
│   │   └── script.js       # Main application logic
│   └── assets/
│       ├── bin.png         # Delete icon
│       ├── edit-text.png   # Edit icon
│       ├── chat.png        # Comment icon
│       ├── search.png      # Search icon
│       ├── filter.png      # Sort/filter icon
│       └── down.png        # Dropdown arrow icon
├── .gitignore
├── requirements.txt
└── README.md
```

## Installation 🚀

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Clone the repository**
```bash
   git clone https://github.com/Ell-716/recipe-keeper.git
   cd recipe-keeper
```

2. **Install Python dependencies**
```bash
   pip install -r requirements.txt
```

3. **Start the backend server**
```bash
   cd backend
   python api.py
```
   The API will be available at `http://localhost:8000`

4. **Open the frontend**

   Option 1: Open directly in browser
```bash
   # Simply open frontend/index.html in your browser
```

   Option 2: Use a local server (recommended)
```bash
   cd frontend
   python -m http.server 5500
```
   Then visit `http://localhost:5500`

## API Documentation 📚

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### API Endpoints

#### Recipes
- `GET /recipes` - Get all recipes (supports `?search=query` parameter)
- `POST /recipes` - Create a new recipe
- `GET /recipes/{recipe_id}` - Get a specific recipe
- `PUT /recipes/{recipe_id}` - Update a recipe
- `DELETE /recipes/{recipe_id}` - Delete a recipe

#### Comments
- `GET /recipes/{recipe_id}/comments` - Get all comments for a recipe
- `POST /recipes/{recipe_id}/comments` - Add a comment to a recipe
- `DELETE /comments/{comment_id}` - Delete a comment

## Usage Guide 📖

### Adding Tags to Recipes

When creating or editing a recipe, you can add tags in the "Tags (Optional)" field. Simply enter tag names separated by commas:

```
Breakfast, Vegan, Quick
```

**Pre-styled Tag Categories:**

- **Meal Types**: Breakfast, Lunch, Dinner, Dessert, Snack, Appetizer
- **Dietary**: Vegan, Vegetarian, Gluten Free, Dairy Free, Keto, Paleo
- **Characteristics**: Quick, Easy, Healthy, Comfort, Spicy, Sweet

Tags are displayed as color-coded badges at the bottom of recipe cards, just above the action icons (Edit, Delete, Comments).

## Credits 🙏

- Icons from [Flaticon](https://www.flaticon.com/)
- Background images from [Unsplash](https://unsplash.com/)

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Contributing 🤝

Contributions, issues, and feature requests are welcome!

## Author ✍️

Created as a learning project for JavaScript course.

---

**Enjoy cooking! 👨‍🍳👩‍🍳**
