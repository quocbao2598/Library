# 🚀 CI/CD Setup Guide - Library Management System

## 📋 Overview

Hệ thống CI/CD này sử dụng:
- **GitHub Actions** cho automation
- **Docker Hub** cho container registry  
- **Docker Compose** cho deployment
- **Spring Boot Actuator** cho health checks

---

## 🔧 Setup Instructions

### 1. **Docker Hub Setup**

#### a) Tạo account và repository:
```bash
# 1. Đăng ký tại https://hub.docker.com/
# 2. Tạo private repository: yourusername/library-management
# 3. Note lại username và repository name
```

#### b) Tạo Access Token:
```bash
# 1. Vào Account Settings > Security
# 2. Click "New Access Token"
# 3. Name: "github-actions-token"
# 4. Permissions: Read, Write, Delete
# 5. Copy token (chỉ hiện 1 lần!)
```

### 2. **GitHub Secrets Setup**

Vào GitHub repository > Settings > Secrets and variables > Actions:

```bash
# Required secrets:
DOCKER_HUB_USERNAME=your-docker-username
DOCKER_HUB_TOKEN=dckr_pat_xxxxxxxxxxxxx

# Optional secrets (for future use):
POSTGRES_PASSWORD=your-secure-db-password
```

### 3. **Local Development Setup**

```bash
# Clone repository
git clone https://github.com/BossBlossom/Library.git
cd Library

# Copy environment file
cp .env.example .env

# Edit .env with your Docker Hub username
nano .env

# Test local build
docker build -t library-test .

# Test local run
docker run -p 8080:8080 library-test
```

---

## 🔄 CI/CD Workflow

### **Trigger Events:**
- ✅ Push to `main` branch
- ✅ Pull Request to `main`
- ✅ Manual trigger từ GitHub Actions tab

### **Pipeline Stages:**

#### **Stage 1: Test & Build**
```yaml
✅ Checkout code
✅ Setup Java 17
✅ Cache Maven dependencies  
✅ Run unit tests
✅ Build JAR file
✅ Upload artifact
```

#### **Stage 2: Docker Build & Push**
```yaml
✅ Checkout code
✅ Setup Docker Buildx
✅ Login to Docker Hub
✅ Extract metadata & tags
✅ Build multi-stage Docker image
✅ Push to registry
✅ Cache layers
```

#### **Stage 3: Security Scan**
```yaml
✅ Pull built image
✅ Run Trivy vulnerability scan
✅ Upload results to GitHub Security
```

#### **Stage 4: Deploy Notification**
```yaml
✅ Generate deployment summary
✅ Provide quick deploy commands
```

---

## 🐳 Docker Image Strategy

### **Tags được tạo:**
```bash
# Branch builds
yourusername/library-management:main-abc1234

# SHA builds  
yourusername/library-management:main-1234567890ab

# Latest (main branch only)
yourusername/library-management:latest

# PR builds
yourusername/library-management:pr-123
```

### **Multi-stage Build:**
```dockerfile
Stage 1: Maven build environment
├── Copy pom.xml
├── Download dependencies (cached)
├── Copy source code
└── Build JAR file

Stage 2: Runtime environment
├── OpenJDK 17 JRE slim
├── Non-root user setup
├── Copy JAR from stage 1
├── Health check configuration
└── Optimized JVM settings
```

---

## 🚀 Deployment Guide

### **Production Deployment:**

#### **Option 1: Quick Deploy Script**
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy application
./scripts/deploy.sh deploy

# Check status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs

# Restart application
./scripts/deploy.sh restart
```

#### **Option 2: Manual Docker Compose**
```bash
# Update .env file
cp .env.example .env
nano .env  # Set DOCKER_IMAGE=yourusername/library-management:latest

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:8080/actuator/health
```

#### **Option 3: Manual Docker Run**
```bash
# Pull latest image
docker pull yourusername/library-management:latest

# Run PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=librarydb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=0609 \
  -p 5432:5432 \
  postgres:15

# Run application
docker run -d --name library-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/librarydb \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=0609 \
  yourusername/library-management:latest
```

---

## 🔍 Monitoring & Health Checks

### **Health Endpoints:**
```bash
# Application health
curl http://localhost:8080/actuator/health

# Application info
curl http://localhost:8080/actuator/info

# Application metrics
curl http://localhost:8080/actuator/metrics
```

### **Container Health:**
```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Container logs
docker-compose -f docker-compose.prod.yml logs -f library-app

# Container stats
docker stats library-app-prod
```

---

## 🔧 Troubleshooting

### **Common Issues:**

#### **Build Failures:**
```bash
# Check GitHub Actions logs
# Go to: Repository > Actions > Failed workflow > Job details

# Common fixes:
1. Check Java version compatibility
2. Verify Maven dependencies
3. Check test failures
4. Verify Docker Hub credentials
```

#### **Docker Push Failures:**
```bash
# Verify secrets:
echo ${{ secrets.DOCKER_HUB_USERNAME }}
echo ${{ secrets.DOCKER_HUB_TOKEN }}

# Check Docker Hub repository exists
# Check repository is private/public as expected
# Verify token permissions (Read, Write, Delete)
```

#### **Application Start Failures:**
```bash
# Check application logs
docker logs library-app-prod

# Common issues:
1. Database connection refused
2. Port already in use
3. Environment variables not set
4. Health check timeouts
```

#### **Database Connection Issues:**
```bash
# Check PostgreSQL container
docker logs library-postgres-prod

# Test connection
docker exec -it library-postgres-prod psql -U postgres -d librarydb

# Check network connectivity
docker network ls
docker network inspect library-network-prod
```

---

## 📊 Performance Optimization

### **Docker Image Optimization:**
```dockerfile
# Current optimizations:
✅ Multi-stage build (smaller final image)
✅ Maven dependency caching
✅ Non-root user security
✅ Optimized JVM settings
✅ Health check configuration

# Further optimizations:
🔄 Use distroless base image
🔄 Custom JRE with jlink
🔄 Layer caching strategies
```

### **CI/CD Optimization:**
```yaml
# Current optimizations:
✅ Maven dependency caching
✅ Docker layer caching
✅ Parallel job execution
✅ Conditional job execution

# Further optimizations:
🔄 Matrix builds for multiple Java versions
🔄 Integration test environments
🔄 Automated performance testing
```

---

## 🔒 Security Best Practices

### **Implemented:**
- ✅ Non-root container user
- ✅ Secret management với GitHub Secrets
- ✅ Docker Hub token authentication
- ✅ Vulnerability scanning với Trivy
- ✅ Private Docker repository

### **Recommended:**
- 🔄 Image signing với Docker Content Trust
- 🔄 HTTPS termination với reverse proxy
- 🔄 Database connection encryption
- 🔄 Application-level authentication

---

## 📚 Next Steps

### **Phase 1: Current Implementation**
- ✅ Basic CI/CD pipeline
- ✅ Docker containerization
- ✅ Health checks
- ✅ Local deployment

### **Phase 2: Enhanced Features (Future)**
- 🔄 Integration tests trong pipeline
- 🔄 Database migrations với Flyway
- 🔄 Monitoring với Prometheus/Grafana
- 🔄 Load balancing và scaling

### **Phase 3: Production Ready (Advanced)**
- 🔄 Kubernetes deployment
- 🔄 Blue-green deployments
- 🔄 Automated rollbacks
- 🔄 Performance monitoring

---

## 🆘 Support & Resources

### **Documentation:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Hub Docs](https://docs.docker.com/docker-hub/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

### **Troubleshooting:**
- Check GitHub Actions logs
- Check Docker Hub repository
- Test local builds first
- Verify all secrets are set

---

*🎯 Created for learning purposes - Library Management System CI/CD*
