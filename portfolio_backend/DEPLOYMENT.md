# Django Portfolio Backend - Production Deployment Guide

This guide covers multiple deployment options for the Django Portfolio Backend, from simple VPS deployment to containerized solutions.

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Python 3.11+
- PostgreSQL 13+
- Redis 6+
- Nginx
- Domain name (optional, for SSL)

### Environment Setup

1. **Clone and prepare the project:**
```bash
git clone <your-repo-url>
cd portfolio_backend
cp .env.example .env
```

2. **Update environment variables in `.env`:**
```bash
# Required settings
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Email configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Optional: Error monitoring
SENTRY_DSN=https://your-sentry-dsn
```

## 📋 Deployment Options

### Option 1: Automated Script Deployment

The easiest way to deploy on a fresh Ubuntu server:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Install all system dependencies
- Setup PostgreSQL and Redis
- Configure Python virtual environment
- Setup Nginx and SSL (with Let's Encrypt)
- Configure process management with Supervisor
- Create automated backups

### Option 2: Docker Deployment

For containerized deployment with Docker Compose:

```bash
# Create environment file
cp .env.example .env
# Edit .env with your settings

# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Check status
docker-compose ps
```

### Option 3: Manual Deployment

For custom setups or when you need more control:

#### 1. System Dependencies
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip postgresql redis-server nginx supervisor
```

#### 2. Database Setup
```bash
sudo -u postgres createdb portfolio_db
sudo -u postgres createuser portfolio_user
sudo -u postgres psql -c "ALTER USER portfolio_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;"
```

#### 3. Application Setup
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set production settings
export DJANGO_SETTINGS_MODULE=portfolio_backend.settings_production

# Run migrations and collect static files
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

#### 4. Process Management
Create `/etc/supervisor/conf.d/portfolio.conf`:
```ini
[program:portfolio]
command=/path/to/your/venv/bin/gunicorn portfolio_backend.wsgi:application --bind 127.0.0.1:8000
directory=/path/to/your/project
user=your-user
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/portfolio.log
```

#### 5. Nginx Configuration
Create `/etc/nginx/sites-available/portfolio`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /static/ {
        alias /var/www/portfolio/static/;
    }
    
    location /media/ {
        alias /var/www/portfolio/media/;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Security Checklist

### Essential Security Settings

- [ ] **Environment Variables**: All sensitive data in `.env` file
- [ ] **Secret Keys**: Generated unique SECRET_KEY and JWT_SECRET_KEY
- [ ] **Database**: Strong password, limited user permissions
- [ ] **HTTPS**: SSL certificate installed and configured
- [ ] **Firewall**: Only necessary ports open (80, 443, 22)
- [ ] **Updates**: System and dependencies up to date

### Django Security Settings

The production settings include:
- HTTPS enforcement
- Secure cookies
- HSTS headers
- XSS protection
- Content type sniffing protection
- CSRF protection
- Rate limiting

### Database Security

- Use strong passwords
- Enable SSL connections
- Regular backups
- Limited user permissions
- Network isolation

## 📊 Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `/health/` - Basic health check
- `/api/auth/verify/` - Authentication system check

### Logging

Logs are configured for:
- Application errors: `/var/log/supervisor/portfolio.log`
- Nginx access/errors: `/var/log/nginx/`
- System logs: `journalctl -u supervisor`

### Monitoring with Docker

Enable monitoring stack:
```bash
docker-compose --profile monitoring up -d
```

Access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Backup Strategy

Automated backups include:
- Database dumps (daily)
- Media files (daily)
- 30-day retention policy

Manual backup:
```bash
# Database
pg_dump -h localhost -U portfolio_user portfolio_db > backup.sql

# Media files
tar -czf media_backup.tar.gz /var/www/portfolio/media/
```

## 🔧 Troubleshooting

### Common Issues

1. **Static files not loading**
   ```bash
   python manage.py collectstatic --noinput
   sudo systemctl restart nginx
   ```

2. **Database connection errors**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U portfolio_user -d portfolio_db
   ```

3. **Application not starting**
   ```bash
   # Check supervisor logs
   sudo supervisorctl tail -f portfolio
   
   # Restart application
   sudo supervisorctl restart portfolio
   ```

4. **SSL certificate issues**
   ```bash
   # Renew Let's Encrypt certificate
   sudo certbot renew
   sudo systemctl reload nginx
   ```

### Performance Optimization

1. **Database optimization**
   - Enable connection pooling
   - Regular VACUUM and ANALYZE
   - Monitor slow queries

2. **Caching**
   - Redis for session storage
   - Template caching
   - API response caching

3. **Static files**
   - CDN for static assets
   - Gzip compression
   - Browser caching headers

## 📈 Scaling

### Horizontal Scaling

For high-traffic scenarios:

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple App Servers**: Run multiple Gunicorn instances
3. **Database**: Read replicas for PostgreSQL
4. **Cache**: Redis cluster
5. **CDN**: CloudFlare or AWS CloudFront

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize Gunicorn workers
- Database performance tuning

## 🆘 Support

### Getting Help

1. Check logs first
2. Review this deployment guide
3. Check Django documentation
4. Create GitHub issue with:
   - Error messages
   - System information
   - Steps to reproduce

### Maintenance Schedule

- **Daily**: Automated backups
- **Weekly**: Security updates
- **Monthly**: Performance review
- **Quarterly**: Full system update

---

## 📝 Notes

- Always test deployments in staging first
- Keep backups before major updates
- Monitor application performance
- Regular security audits
- Document any custom changes
