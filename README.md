# Maath Mphepo Portfolio

A modern, full-stack portfolio website built with Next.js (frontend) and Django (backend). This project showcases a professional portfolio with a blog system, project showcase, skills display, and contact functionality.

## 🚀 Tech Stack

**Frontend:**
- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React Icons

**Backend:**
- Django 4.2
- Django REST Framework
- JWT Authentication
- PostgreSQL (Production) / SQLite (Development)
- WhiteNoise for static files

## 📁 Project Structure

```
├── src/                    # Next.js frontend source
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── portfolio_backend/     # Django backend
│   ├── blog/             # Blog app
│   ├── projects/         # Projects app
│   ├── skills/           # Skills app
│   ├── contact/          # Contact app
│   └── core/             # Core app
├── public/               # Static assets
└── README.md
```

## 🌐 Deployment Guide

This project is designed for simple deployment using:
- **Frontend**: Vercel (recommended for Next.js)
- **Backend**: Render (free tier available)

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git
- Vercel account
- Render account

## 🚀 Frontend Deployment (Vercel)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub, GitLab, or Bitbucket
2. Make sure the root directory contains your Next.js application

### Step 2: Deploy to Vercel

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variable:
     ```
     NEXT_PUBLIC_API_URL = https://your-backend-name.onrender.com
     ```
   - Replace `your-backend-name` with your actual Render service name

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend
   - Your site will be available at `https://your-project-name.vercel.app`

### Step 3: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## 🗄️ Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Navigate to backend directory:**
   ```bash
   cd portfolio_backend
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Update .env file with your values:**
   ```env
   DEBUG=False
   SECRET_KEY=your-super-secret-key-here
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

### Step 2: Deploy to Render

1. **Create Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your repository
   - Select the repository containing your Django backend

2. **Configure Service:**
   - **Name**: Choose a name (e.g., `portfolio-backend`)
   - **Environment**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn portfolio_backend.wsgi:application`
   - **Root Directory**: `portfolio_backend` (if backend is in subdirectory)

3. **Set Environment Variables:**
   ```
   PYTHON_VERSION = 3.11.0
   DEBUG = False
   SECRET_KEY = [Generate a secure secret key]
   CORS_ALLOWED_ORIGINS = https://your-frontend-domain.vercel.app
   ```

4. **Database Setup:**
   - In Render dashboard, create a new PostgreSQL database
   - Copy the "Internal Database URL"
   - Add it as environment variable:
     ```
     DATABASE_URL = [Your PostgreSQL connection string]
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Your API will be available at `https://your-service-name.onrender.com`

### Step 3: Update Frontend with Backend URL

1. Go back to your Vercel project settings
2. Update the environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-name.onrender.com
   ```
3. Redeploy your frontend (Vercel will auto-deploy on the next push)

## 🔧 Local Development

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   - Frontend: http://localhost:3000

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd portfolio_backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server:**
   ```bash
   python manage.py runserver
   ```

7. **Open browser:**
   - Backend API: http://localhost:8000
   - Admin panel: http://localhost:8000/admin

## 🔐 Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
# Required
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/db

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🔄 CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- Your Vercel domain (production)
- All `*.vercel.app` subdomains

Update `CORS_ALLOWED_ORIGINS` in your backend environment variables to match your frontend URL.

## 📊 Database Setup

### Development
- Uses SQLite by default
- Database file: `portfolio_backend/db.sqlite3`

### Production (Render)
- Uses PostgreSQL
- Automatically configured via `DATABASE_URL` environment variable
- Render provides managed PostgreSQL databases

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
   - Check that URLs don't have trailing slashes

2. **Database Connection:**
   - Verify `DATABASE_URL` is correctly set
   - Ensure database is running and accessible

3. **Static Files Not Loading:**
   - Run `python manage.py collectstatic` in production
   - Verify WhiteNoise is properly configured

4. **Build Failures:**
   - Check Python version (3.11+ recommended)
   - Ensure all dependencies are in `requirements.txt`

### Logs and Debugging

- **Vercel**: Check function logs in Vercel dashboard
- **Render**: View logs in Render service dashboard
- **Local**: Check terminal output for error messages

## 📝 Additional Notes

- The build process automatically runs database migrations
- Static files are served by WhiteNoise in production
- JWT tokens are used for authentication
- The admin panel is available at `/admin` on the backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
