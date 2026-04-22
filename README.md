# Recipe Keeper 🍳

A full-stack web application for storing and managing your favorite recipes with search, sorting, and commenting features.

## 🌐 Live Demo

- **Frontend**: https://my-recipe-keeper.vercel.app
- **API**: https://recipe-keeper-backend.fly.dev
- **API Docs**: https://recipe-keeper-backend.fly.dev/docs

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
- **pytest**: Backend testing framework
- **pytest-asyncio**: Async test support
- **pytest-cov**: Code coverage reporting
- **httpx**: HTTP client for testing FastAPI endpoints
- **Jest**: Frontend testing framework
- **jsdom**: DOM simulation for testing

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
│   ├── package.json        # npm configuration
│   ├── jest.config.js      # Jest test configuration
│   ├── .gitignore          # Git ignore rules
│   ├── css/
│   │   ├── styles.css      # Main styles
│   │   └── print.css       # Print-specific styles
│   ├── js/
│   │   ├── api.js          # API functions
│   │   ├── validators.js   # Validation, formatting & XSS sanitization
│   │   └── script.js       # Main application logic
│   ├── tests/              # Frontend test suite
│   │   ├── validators.test.js # Sanitization tests
│   │   └── api.test.js     # API configuration tests
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
- Node.js and npm (optional, for frontend testing)

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

5. **Install frontend dependencies** (optional, for testing)
```bash
   cd frontend
   npm install
```

6. **Open the frontend**

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

Both backend and frontend have comprehensive test coverage to ensure reliability and catch regressions.

### Backend Testing

#### Test Coverage

- **94% code coverage** across all backend API endpoints
- **20 passing tests** covering CRUD operations, validation, and edge cases

#### Running Backend Tests

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

### What's Tested (Backend)

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

### Frontend Testing

The frontend uses Jest for testing critical functionality including XSS protection and API configuration.

#### Test Coverage

- **39 passing tests** covering sanitization and API validation
- **16 sanitization tests** ensuring XSS protection
- **23 API tests** validating endpoint construction and configuration

#### Running Frontend Tests

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

#### What's Tested (Frontend)

**Input Sanitization (16 tests):**
- ✅ Escape script tags to prevent XSS
- ✅ Escape img tags with onerror handlers
- ✅ Escape HTML special characters (`<`, `>`, `&`, `"`, `'`)
- ✅ Handle empty strings, null, and undefined inputs
- ✅ Process very long strings
- ✅ Sanitize recipe names and comments with special characters

**API Configuration (23 tests):**
- ✅ API base URL validation
- ✅ Endpoint construction (recipes, comments, search)
- ✅ HTTP method validation (GET, POST, PUT, DELETE)
- ✅ Request headers validation
- ✅ Error status code handling (404, 500, 422, 429)
- ✅ JSON parsing and response handling

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

## Deployment 🚀

### Backend — Fly.io

The backend is deployed on [Fly.io](https://fly.io) with a persistent volume for JSON data storage.

#### Prerequisites

```bash
# Install the Fly CLI
brew install flyctl   # macOS
# or: curl -L https://fly.io/install.sh | sh

# Log in
fly auth login
```

#### First-time setup

```bash
cd backend

# Create the app (already configured in fly.toml)
fly launch --no-deploy

# Create a persistent volume for recipes.json / comments.json
fly volume create recipe_data -r ams -n 1 --app recipe-keeper-backend

# Deploy
fly deploy
```

#### Environment variables

The following are set in `fly.toml` under `[env]` and do not need to be configured manually:

| Variable | Value | Purpose |
|----------|-------|---------|
| `ENVIRONMENT` | `production` | Enables production logging |
| `DATA_DIR` | `/data` | Points the app to the mounted volume |

For secrets (e.g. `ALLOWED_ORIGINS`), use:

```bash
fly secrets set ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### How data persistence works

- A Fly volume named `recipe_data` is mounted at `/data` inside the container.
- On each startup, `init_data.sh` creates empty `recipes.json` and `comments.json` if they don't exist.
- All recipe and comment data survives redeploys because it lives on the volume, not in the container image.

#### Migrating local recipes to production

```bash
# Post each recipe from your local recipes.json to the live API
curl -X POST https://recipe-keeper-backend.fly.dev/recipes \
  -H "Content-Type: application/json" \
  -d '{"name":"...","ingredients":"...","steps":"...","imageUrl":"...","tags":[...]}'
```

#### Useful Fly commands

```bash
# View live logs
fly logs --app recipe-keeper-backend

# SSH into the running machine
fly ssh console --app recipe-keeper-backend

# Check volume contents
fly ssh console --app recipe-keeper-backend -C "cat /data/recipes.json"

# Redeploy after code changes
cd backend && fly deploy
```

### Frontend — Vercel

The frontend is deployed on [Vercel](https://vercel.com) directly from the `frontend/` directory.

#### Setup

1. Import the repository on [vercel.com/new](https://vercel.com/new)
2. Set the **Root Directory** to `frontend`
3. Leave framework preset as **Other** (no build step required)
4. Click **Deploy**

Vercel automatically redeploys on every push to `main`.

#### After deploying

Update the backend CORS secret with your Vercel URL:

```bash
fly secrets set ALLOWED_ORIGINS=https://my-recipe-keeper.vercel.app,http://localhost:5500,http://127.0.0.1:5500
```

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
