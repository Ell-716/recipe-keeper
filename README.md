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
- **Download Recipe as PDF**: Export any recipe to a PDF file with one click
  - Click the download icon on any recipe card
  - Automatically generates a formatted PDF using jsPDF
  - Includes recipe name, image (if available), ingredients, and steps
  - PDF file named after the recipe (e.g., "chocolate-cake.pdf")
- **Print Recipe**: Print any recipe with a clean, printer-friendly layout
  - Click the print icon on any recipe card
  - Opens optimized print preview
  - Includes recipe name, image, ingredients list, and steps
  - Works with browser print or "Save as PDF"
- **Image Placeholder**: Recipes without images display a styled placeholder
  - Light gray background with fork and knife icon
  - "No image available" text
  - Consistent sizing across all view modes
- **Responsive Design**: Clean, professional UI with background imagery
- **Icon-based Actions**: Intuitive edit, delete, comment, download, and print icons
- **Recipe Display**: Beautiful recipe cards with images, formatted ingredients, and step-by-step instructions

## Security Features 🔒

### XSS Protection
- **HTML Sanitization**: All user-generated content (recipe names, comments, tags) is sanitized before rendering
- **Character Escaping**: Dangerous characters (`<`, `>`, `&`, `"`, `'`) are escaped to prevent script injection

### Rate Limiting
- **API Protection**: All endpoints are rate-limited to prevent abuse
- **Limits by Endpoint**:
  - GET requests: 100 requests/minute
  - POST/PUT requests: 20 requests/minute
  - DELETE requests: 10 requests/minute

### CORS Configuration
- **Environment-based**: CORS origins configurable via environment variables
- **Production-ready**: Easily restrict to specific domains in production

### Logging
- **Structured Logging**: All API requests and operations are logged
- **Debug/Production Modes**: Log level adjusts based on environment
- **File Output**: Logs written to `backend/logs/recipe_keeper.log`

## Tech Stack 🛠️

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **SlowAPI**: Rate limiting
- **python-dotenv**: Environment configuration
- **JSON**: File-based storage

### Testing
- **pytest**: Testing framework
- **pytest-asyncio**: Async test support
- **pytest-cov**: Code coverage reporting
- **httpx**: HTTP client for testing FastAPI endpoints

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with custom design
- **Vanilla JavaScript**: Dynamic functionality
- **Fetch API**: HTTP requests
- **jsPDF**: PDF generation for recipe downloads

## Project Structure 📁
```
recipe-keeper/
├── backend/
│   ├── api.py              # FastAPI application
│   ├── pytest.ini          # Pytest configuration
│   ├── .env                # Environment variables (git-ignored)
│   ├── .env.example        # Environment template
│   ├── logs/               # Application logs (git-ignored)
│   │   └── recipe_keeper.log
│   ├── tests/              # Test suite
│   │   ├── conftest.py     # Test fixtures and configuration
│   │   ├── test_recipes.py # Recipe endpoint tests
│   │   └── test_comments.py# Comment endpoint tests
│   ├── recipes.json        # Recipe data storage
│   └── comments.json       # Comments data storage
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── print-recipe.html   # Print-friendly recipe page
│   ├── css/
│   │   ├── styles.css      # Main styles
│   │   └── print.css       # Print-specific styles
│   ├── js/
│   │   ├── api.js          # API functions
│   │   ├── validators.js   # Validation, formatting & XSS sanitization
│   │   └── script.js       # Main application logic
│   └── assets/
│       ├── bin.png         # Delete icon
│       ├── edit-text.png   # Edit icon
│       ├── chat.png        # Comment icon
│       ├── download.png    # Download PDF icon
│       ├── print.png       # Print icon
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

3. **Configure environment variables**
```bash
   cd backend
   cp .env.example .env
   # Edit .env if needed (defaults work for development)
```

4. **Start the backend server**
```bash
   cd backend
   python api.py
```
   The API will be available at `http://localhost:8000`

5. **Open the frontend**

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

## Testing 🧪

The backend API has comprehensive test coverage to ensure reliability and catch regressions.

### Test Coverage

- **94% code coverage** across all backend API endpoints
- **20 passing tests** covering CRUD operations, validation, and edge cases

### Running Tests

```bash
cd backend

# Run all tests
pytest -v

# Run specific test file
pytest tests/test_recipes.py -v
pytest tests/test_comments.py -v

# Run with coverage report
pytest --cov=api --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=api --cov-report=html
# Open htmlcov/index.html in browser
```

### What's Tested

**Recipe Endpoints (12 tests):**
- ✅ GET /recipes - Retrieve all recipes
- ✅ POST /recipes - Create new recipe with validation
- ✅ GET /recipes/{id} - Get single recipe
- ✅ PUT /recipes/{id} - Update recipe
- ✅ DELETE /recipes/{id} - Delete recipe
- ✅ GET /recipes?search=query - Search functionality
- ✅ Comment count aggregation
- ✅ Cascade deletion of comments
- ✅ 404 error handling
- ✅ Input validation (empty fields rejected)

**Comment Endpoints (8 tests):**
- ✅ POST /recipes/{id}/comments - Add comment
- ✅ GET /recipes/{id}/comments - Get all comments
- ✅ DELETE /comments/{id} - Delete comment
- ✅ Multiple comments per recipe
- ✅ 404 error handling
- ✅ Input validation (empty fields rejected)

## Environment Configuration ⚙️

The backend uses environment variables for configuration. Copy `.env.example` to `.env` and customize as needed:

```bash
# backend/.env
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5500,http://127.0.0.1:5500
ENVIRONMENT=development
```

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | localhost ports |
| `ENVIRONMENT` | Set to `production` for production settings | `development` |

**Production notes:**
- Set `ALLOWED_ORIGINS` to your specific domain(s)
- Set `ENVIRONMENT=production` for INFO-level logging

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
