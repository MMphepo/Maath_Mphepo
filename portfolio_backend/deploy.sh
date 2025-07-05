#!/bin/bash

# Django Portfolio Backend Deployment Script
# This script handles production deployment with proper security and optimization

set -e  # Exit on any error

echo "🚀 Starting Django Portfolio Backend Deployment"
echo "================================================"

# Configuration
PROJECT_NAME="portfolio_backend"
VENV_NAME="portfolio_env"
PYTHON_VERSION="3.11"
DB_NAME="portfolio_db"
DB_USER="portfolio_user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Install system dependencies
install_system_deps() {
    log_info "Installing system dependencies..."
    
    # Update package list
    sudo apt update
    
    # Install Python and development tools
    sudo apt install -y \
        python${PYTHON_VERSION} \
        python${PYTHON_VERSION}-dev \
        python${PYTHON_VERSION}-venv \
        python3-pip \
        build-essential \
        libpq-dev \
        postgresql \
        postgresql-contrib \
        redis-server \
        nginx \
        supervisor \
        git \
        curl \
        wget \
        unzip
    
    log_success "System dependencies installed"
}

# Setup PostgreSQL database
setup_database() {
    log_info "Setting up PostgreSQL database..."
    
    # Start PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" || log_warning "Database may already exist"
    sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" || log_warning "User may already exist"
    sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET client_encoding TO 'utf8';"
    sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET default_transaction_isolation TO 'read committed';"
    sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET timezone TO 'UTC';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    
    log_success "Database setup completed"
}

# Setup Redis
setup_redis() {
    log_info "Setting up Redis..."
    
    # Start Redis service
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    # Configure Redis for production
    sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    sudo systemctl restart redis-server
    
    log_success "Redis setup completed"
}

# Create Python virtual environment
setup_venv() {
    log_info "Setting up Python virtual environment..."
    
    # Create virtual environment
    python${PYTHON_VERSION} -m venv ${VENV_NAME}
    source ${VENV_NAME}/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip setuptools wheel
    
    # Install Python dependencies
    pip install -r requirements.txt
    
    log_success "Virtual environment setup completed"
}

# Configure Django settings
configure_django() {
    log_info "Configuring Django settings..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        log_warning "Created .env file from template. Please update it with your settings."
    fi
    
    # Generate secret key if not set
    if ! grep -q "SECRET_KEY=" .env || grep -q "your-super-secret-key-here" .env; then
        SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=${SECRET_KEY}/" .env
        log_success "Generated new Django secret key"
    fi
    
    # Generate JWT secret key if not set
    if ! grep -q "JWT_SECRET_KEY=" .env || grep -q "your-jwt-secret-key" .env; then
        JWT_SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
        sed -i "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=${JWT_SECRET_KEY}/" .env
        log_success "Generated new JWT secret key"
    fi
    
    log_success "Django configuration completed"
}

# Run Django migrations and setup
setup_django() {
    log_info "Setting up Django application..."
    
    source ${VENV_NAME}/bin/activate
    
    # Set production settings
    export DJANGO_SETTINGS_MODULE=portfolio_backend.settings_production
    
    # Run migrations
    python manage.py migrate
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    # Create superuser if it doesn't exist
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', '${ADMIN_PASSWORD:-AdminPass123!}')
    print('Superuser created')
else:
    print('Superuser already exists')
"
    
    log_success "Django setup completed"
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/${PROJECT_NAME} > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME:-localhost};
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Static files
    location /static/ {
        alias /var/www/portfolio/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /var/www/portfolio/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Django application
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health/ {
        access_log off;
        proxy_pass http://127.0.0.1:8000;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log_success "Nginx configuration completed"
}

# Configure Supervisor for Gunicorn
configure_supervisor() {
    log_info "Configuring Supervisor..."
    
    # Create Supervisor configuration
    sudo tee /etc/supervisor/conf.d/${PROJECT_NAME}.conf > /dev/null <<EOF
[program:${PROJECT_NAME}]
command=$(pwd)/${VENV_NAME}/bin/gunicorn portfolio_backend.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 60 --max-requests 1000 --max-requests-jitter 100
directory=$(pwd)
user=$(whoami)
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/${PROJECT_NAME}.log
environment=DJANGO_SETTINGS_MODULE=portfolio_backend.settings_production
EOF
    
    # Create log directory
    sudo mkdir -p /var/log/supervisor
    
    # Update Supervisor
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start ${PROJECT_NAME}
    
    log_success "Supervisor configuration completed"
}

# Setup SSL with Let's Encrypt (optional)
setup_ssl() {
    if [ -n "${DOMAIN_NAME}" ] && [ "${DOMAIN_NAME}" != "localhost" ]; then
        log_info "Setting up SSL with Let's Encrypt..."
        
        # Install Certbot
        sudo apt install -y certbot python3-certbot-nginx
        
        # Get SSL certificate
        sudo certbot --nginx -d ${DOMAIN_NAME} --non-interactive --agree-tos --email ${EMAIL:-admin@${DOMAIN_NAME}}
        
        # Setup auto-renewal
        sudo systemctl enable certbot.timer
        
        log_success "SSL setup completed"
    else
        log_warning "Skipping SSL setup (no domain name provided)"
    fi
}

# Create backup script
create_backup_script() {
    log_info "Creating backup script..."
    
    tee backup.sh > /dev/null <<EOF
#!/bin/bash
# Database and media backup script

BACKUP_DIR="/var/backups/portfolio"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \${BACKUP_DIR}

# Backup database
pg_dump -h localhost -U ${DB_USER} ${DB_NAME} > \${BACKUP_DIR}/db_backup_\${DATE}.sql

# Backup media files
tar -czf \${BACKUP_DIR}/media_backup_\${DATE}.tar.gz /var/www/portfolio/media/

# Keep only last 30 days of backups
find \${BACKUP_DIR} -name "*.sql" -mtime +30 -delete
find \${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: \${DATE}"
EOF
    
    chmod +x backup.sh
    
    # Add to crontab (daily backup at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -
    
    log_success "Backup script created"
}

# Main deployment function
main() {
    log_info "Starting deployment process..."
    
    # Check prerequisites
    check_root
    
    # Get environment variables
    read -p "Enter database password: " -s DB_PASSWORD
    echo
    read -p "Enter domain name (or press Enter for localhost): " DOMAIN_NAME
    read -p "Enter email for SSL certificate (optional): " EMAIL
    
    # Run deployment steps
    install_system_deps
    setup_database
    setup_redis
    setup_venv
    configure_django
    setup_django
    configure_nginx
    configure_supervisor
    setup_ssl
    create_backup_script
    
    log_success "Deployment completed successfully!"
    echo
    echo "🎉 Your Django Portfolio Backend is now deployed!"
    echo "📝 Next steps:"
    echo "   1. Update your .env file with production settings"
    echo "   2. Configure your domain DNS to point to this server"
    echo "   3. Test the application: http://${DOMAIN_NAME:-localhost}"
    echo "   4. Monitor logs: sudo supervisorctl tail -f ${PROJECT_NAME}"
    echo "   5. Check status: sudo supervisorctl status"
}

# Run main function
main "$@"
