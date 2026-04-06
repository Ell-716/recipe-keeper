# Recipe Keeper - Deployment Guide 🚀

Complete guide for deploying Recipe Keeper to production using Fly.io (backend) and Vercel (frontend).

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Backend Deployment (Fly.io)](#backend-deployment-flyio)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
1. **GitHub Account** (you already have this)
2. **Fly.io Account**
   - Sign up at https://fly.io/
   - Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
   - Requires credit card for verification (won't charge on free tier)
3. **Vercel Account**
   - Sign up at https://vercel.com/
   - Can use GitHub login
   - No credit card required

### Required Tools
- Git
- Docker Desktop (for local testing)
- Fly CLI
- Node.js & npm (for frontend)

---

## Architecture Overview

```
┌─────────────────┐      HTTPS       ┌──────────────────┐
│                 │ ───────────────> │                  │
│  Vercel         │                  │  Fly.io          │
│  (Frontend)     │                  │  (Backend API)   │
│                 │ <─────────────── │                  │
└─────────────────┘      JSON        └──────────────────┘

Static HTML/CSS/JS                 - FastAPI
Auto HTTPS                         - Docker Container
CDN Distribution                   - Auto Scaling
GitHub Auto-Deploy                 - Health Checks
```

**Tech Stack:**
- **Backend**: FastAPI + Docker on Fly.io
- **Frontend**: Vanilla JS on Vercel
- **CI/CD**: GitHub Actions
- **Data**: JSON files (persistent volume on Fly.io)

---

## Backend Deployment (Fly.io)

### Step 1: Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Verify installation:
```bash
fly version
```

### Step 2: Login to Fly.io
```bash
fly auth login
```

This opens a browser for authentication.

### Step 3: Deploy to Fly.io

**Note:** The repository already includes `fly.toml` configuration. You can use it directly or customize it.

**Option A: Use Existing Configuration (Recommended)**

1. Review and update `fly.toml`:
```bash
# Edit fly.toml and change the app name to something unique
# Line 10: app = "recipe-keeper-yourname"
# Line 11: primary_region = "iad"  # or your preferred region
```

2. Create the app:
```bash
fly apps create recipe-keeper-yourname
```

3. Create persistent volume:
```bash
fly volumes create recipe_data --region iad --size 1
```

**Option B: Start Fresh with fly launch**

```bash
# This will detect Dockerfile and create fly.toml
fly launch

# When prompted:
# - App name: Choose a unique name (e.g., "recipe-keeper-yourname")
# - Region: Choose closest to you (e.g., "iad" for Washington DC)
# - PostgreSQL: No
# - Redis: No
# - Deploy now: No (we'll set up environment first)
```

### Step 4: Set Environment Variables

Set the ALLOWED_ORIGINS secret (frontend URL will be added after Vercel deployment):

```bash
# Set production environment
fly secrets set ENVIRONMENT=production

# You'll add ALLOWED_ORIGINS after deploying frontend
# fly secrets set ALLOWED_ORIGINS=https://your-frontend.vercel.app

# View secrets
fly secrets list
```

**Note:** PORT and DATA_DIR are already configured in `fly.toml`, no need to set them as secrets.

### Step 5: Deploy Backend
```bash
# Deploy from project root (fly.toml references backend/Dockerfile)
fly deploy

# Check deployment status
fly status

# View logs
fly logs

# Get app URL
fly info
```

Your backend will be live at: `https://your-app-name.fly.dev`

**Test the API:**
```bash
curl https://your-app-name.fly.dev/recipes
# Should return: []

# Test API docs
open https://your-app-name.fly.dev/docs
```

---

## Frontend Deployment (Vercel)

### Step 1: Update API URL (if needed)

The frontend is already configured to use `https://recipe-keeper-backend.fly.dev` in production.

If your Fly.io app has a different name, update `frontend/js/api.js`:

```javascript
// Line 11: Update with your actual Fly.io URL
return window.ENV?.API_URL || 'https://your-app-name.fly.dev';
```

Commit if changed:
```bash
git add frontend/js/api.js
git commit -m "Update production API URL"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: `.` (current directory)
5. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: (your account)
# - Link to existing project: No
# - Project name: recipe-keeper
# - In which directory is your code located: ./
# - Want to modify settings: No
```

Your frontend will be live at: `https://recipe-keeper-xxx.vercel.app`

### Step 3: Update CORS on Backend

Add your Vercel URL to CORS origins:
```bash
fly secrets set ALLOWED_ORIGINS=https://recipe-keeper-xxx.vercel.app

# Or if you have multiple origins:
fly secrets set ALLOWED_ORIGINS="https://recipe-keeper-xxx.vercel.app,https://www.yourapp.com"
```

### Step 4: Test Production

Visit your Vercel URL and test all features:
- ✅ Loading recipes (empty list initially)
- ✅ Creating a recipe
- ✅ Searching recipes
- ✅ Adding comments
- ✅ PDF export
- ✅ Print functionality

Check browser console for any errors (F12 → Console).

---

## Environment Configuration

### Backend Environment Variables (Fly.io)

Configured in `fly.toml` (non-sensitive) and Fly Secrets (sensitive):

**In fly.toml:**
| Variable | Value | Description |
|----------|-------|-------------|
| `ENVIRONMENT` | `production` | Sets production mode |
| `PORT` | `8000` | Application port |
| `DATA_DIR` | `/app/data` | Persistent storage directory |

**As Fly Secrets:**
| Variable | Value | Description |
|----------|-------|-------------|
| `ALLOWED_ORIGINS` | Vercel URL | CORS configuration |

Set secrets via:
```bash
fly secrets set KEY=value
```

View all secrets:
```bash
fly secrets list
```

### Frontend Configuration

The frontend automatically detects the environment:
- **Local**: Uses `http://localhost:8000`
- **Production**: Uses `https://recipe-keeper-backend.fly.dev` (or your custom URL)

No build step or environment variables needed!

---

## CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated testing.

**Workflow: `.github/workflows/test.yml`**

Runs on every push to `main` or `feature/*` branches:
1. ✅ **Backend Tests** - pytest with coverage
2. ✅ **Frontend Tests** - Jest with coverage
3. ✅ **Docker Build** - Validates Dockerfile builds correctly
4. ✅ **Docker Health Check** - Tests container starts and responds
5. ✅ **Coverage Reports** - Uploads to Codecov

**View workflow status:**
- GitHub → Your Repo → Actions tab
- See test results, logs, and coverage

### Manual Deployment

**Backend (Fly.io):**
```bash
# Deploy manually
fly deploy

# Or deploy with remote builder (faster)
fly deploy --remote-only

# Deploy specific version
git checkout v1.0.0
fly deploy
```

**Frontend (Vercel):**
- Vercel auto-deploys on every push to `main`
- To trigger manual deploy: Push to main or use Vercel dashboard
- Preview deployments created automatically for PRs

### Setting Up Auto-Deploy (Optional)

**Fly.io with GitHub Actions:**

Create `.github/workflows/deploy-production.yml`:
```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'fly.toml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Add `FLY_API_TOKEN` to GitHub Secrets:
```bash
# Get token
fly tokens create deploy

# Add to GitHub: Settings → Secrets → Actions → New secret
# Name: FLY_API_TOKEN
# Value: <paste token>
```

---

## Monitoring & Logs

### Fly.io Monitoring

**View logs:**
```bash
# Recent logs
fly logs

# Follow logs in real-time
fly logs --follow

# Filter by app instance
fly logs --app your-app-name
```

**Check status:**
```bash
# App status
fly status

# Health checks
fly checks list

# VM metrics
fly vm status
```

**Monitor metrics:**
```bash
# Open web dashboard
fly dashboard

# Or visit: https://fly.io/apps/your-app-name
```

**SSH into container:**
```bash
# Access running container
fly ssh console

# Run commands
ls -la /app/data/
cat /app/data/recipes.json
```

**Check volume:**
```bash
# List volumes
fly volumes list

# Volume details
fly volumes show <volume-id>
```

### Vercel Monitoring

**View logs:**
- Vercel Dashboard → Project → Deployments → Click deployment → Logs
- Real-time logs for each deployment
- Function execution logs

**Analytics:**
- Vercel Dashboard → Analytics
- Page views, bandwidth, performance metrics
- Requires Vercel Pro for detailed analytics

**Deployment status:**
```bash
# Using Vercel CLI
vercel ls

# Get deployment URL
vercel inspect <deployment-url>
```

---

## Troubleshooting

### Backend Issues

**Problem: App won't start**
```bash
# Check logs for errors
fly logs

# Check app configuration
fly config show

# Verify environment variables
fly secrets list

# Restart app
fly apps restart your-app-name

# Check VM status
fly vm status
```

**Problem: Database/JSON file not persisting**
```bash
# Verify volume exists
fly volumes list

# SSH into container and check
fly ssh console
ls -la /app/data/
cat /app/data/recipes.json

# Check if DATA_DIR is set correctly
echo $DATA_DIR
```

If volume doesn't exist:
```bash
# Create volume
fly volumes create recipe_data --region iad --size 1

# Verify [mounts] in fly.toml
cat fly.toml | grep -A 2 "\[mounts\]"
```

**Problem: CORS errors in frontend**
```bash
# Check current CORS settings
fly secrets list

# Update ALLOWED_ORIGINS
fly secrets set ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Deploy to apply changes
fly deploy
```

**Problem: Port binding errors**
- Verify `PORT=8000` in fly.toml `[env]` section
- Check `internal_port = 8000` in `[http_service]` section
- Both should match

### Frontend Issues

**Problem: API calls fail with CORS errors**
1. Open browser DevTools (F12) → Console
2. Check the error message
3. Verify ALLOWED_ORIGINS on backend includes your Vercel URL
4. Ensure Vercel URL matches exactly (with/without www, https vs http)

**Problem: API calls fail with 404**
1. Check `frontend/js/api.js` line 11 has correct Fly.io URL
2. Test backend directly: `curl https://your-app-name.fly.dev/recipes`
3. Check browser console for the actual URL being called

**Problem: Blank page or "Cannot read properties"**
1. Check Vercel deployment logs for build errors
2. Open browser console (F12) for JavaScript errors
3. Verify all files deployed: Go to Vercel → Deployment → Source
4. Check that `index.html`, `js/`, `css/`, `assets/` are present

**Problem: Changes not deploying**
```bash
# Vercel auto-deploys from GitHub
# Make sure you pushed to main branch
git status
git push origin main

# Check deployment status
# Vercel Dashboard → Deployments → See latest

# Force redeploy
# Vercel Dashboard → Deployment → ⋯ → Redeploy
```

### Common Issues

**Problem: "fly: command not found"**
```bash
# macOS/Linux: Add Fly CLI to PATH
export PATH="$HOME/.fly/bin:$PATH"

# Add to ~/.zshrc or ~/.bashrc permanently
echo 'export PATH="$HOME/.fly/bin:$PATH"' >> ~/.zshrc

# Or reinstall
curl -L https://fly.io/install.sh | sh
```

**Problem: Docker build fails locally**
```bash
# Test Docker build
cd backend
docker build -t recipe-test .

# If it fails, check:
# 1. Docker Desktop is running
# 2. Dockerfile syntax is correct
# 3. requirements.txt is accessible
```

**Problem: GitHub Actions failing**
1. Check Actions tab for error logs
2. Common issues:
   - Test failures: Fix tests locally first
   - Docker build: Test `docker build` locally
   - Coverage: Ensure pytest-cov installed
3. Re-run failed jobs: Actions → Failed workflow → Re-run jobs

---

## Production Checklist ✅

Before going live, verify:

### Backend
- [ ] All tests passing: `cd backend && pytest -v`
- [ ] Docker builds: `cd backend && docker build -t test .`
- [ ] fly.toml configured with unique app name
- [ ] Fly.io account created and CLI installed
- [ ] Persistent volume created: `fly volumes list`
- [ ] Environment secrets set: `fly secrets list`
- [ ] Backend deployed: `fly status`
- [ ] API responding: `curl https://your-app.fly.dev/recipes`
- [ ] Health checks passing: `fly checks list`
- [ ] Logs accessible: `fly logs`

### Frontend
- [ ] All tests passing: `cd frontend && npm test`
- [ ] API URL correct in `js/api.js` (line 11)
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Can access frontend URL
- [ ] All features work: Create, Edit, Delete, Search, Comments, PDF, Print
- [ ] No console errors (F12 → Console)
- [ ] CORS configured: Backend ALLOWED_ORIGINS includes Vercel URL

### Integration
- [ ] Frontend can fetch from backend
- [ ] Can create recipes from frontend
- [ ] Can add comments
- [ ] Can delete items
- [ ] Search works
- [ ] PDF export works
- [ ] Print functionality works

### CI/CD
- [ ] GitHub Actions passing: Check Actions tab
- [ ] Coverage reports working
- [ ] Docker build test passing

### Documentation
- [ ] README.md updated with live URLs
- [ ] DEPLOYMENT.md reviewed
- [ ] CLAUDE.md present (for future development)

---

## Live URLs

After successful deployment, update `README.md` with:

```markdown
## 🌐 Live Demo

- **Frontend**: https://recipe-keeper-xxx.vercel.app
- **API**: https://your-app-name.fly.dev
- **API Documentation**: https://your-app-name.fly.dev/docs
```

---

## Cost Breakdown

### Fly.io (Backend)
**Free Tier Includes:**
- Up to 3 shared-cpu-1x VMs (256MB RAM)
- 3GB persistent volume storage
- 160GB outbound data transfer/month

**Cost**: $0/month (within free tier limits)

**Upgrade Costs** (if needed):
- Shared CPU 1x (256MB): $1.94/month
- Additional storage: $0.15/GB/month

### Vercel (Frontend)
**Hobby Plan (Free):**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS & CDN
- Preview deployments for PRs
- Custom domains

**Cost**: $0/month

**Pro Plan** (if needed): $20/month
- Includes analytics, advanced monitoring

---

## Total Monthly Cost: $0 🎉

Both services offer generous free tiers perfect for personal projects and MVPs.

---

## Support & Resources

**Fly.io:**
- Documentation: https://fly.io/docs/
- Community: https://community.fly.io/
- Status: https://status.fly.io/

**Vercel:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://www.vercel-status.com/

**This Project:**
- GitHub Issues: Report bugs and request features
- GitHub Actions: Monitor CI/CD status
- Application Logs: Check Fly.io and Vercel dashboards

---

**Happy Deploying! 🚀**
