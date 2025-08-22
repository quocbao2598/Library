# Jenkins CI/CD Setup Guide

## 🚀 Complete Jenkins-based CI/CD Pipeline

Hướng dẫn này sẽ thiết lập pipeline Jenkins cho dự án Library Management System với flow: **Code Push → Jenkins → CI/CD → Build Image → Push to Registry → Deploy**.

## 📋 Prerequisites

### 1. Server Requirements
- **Build Server**: Ubuntu 20.04+ với ít nhất 4GB RAM, 2 CPU cores
- **Deployment Server**: Ubuntu 20.04+ với Docker và docker-compose
- **Network**: Servers có thể kết nối với nhau và internet

### 2. Required Software
```bash
# On Jenkins Server
- Java 17+
- Maven 3.8+
- Docker 20.10+
- Git

# On Deployment Server  
- Docker 20.10+
- Docker Compose 2.0+
```

## 🔧 Step 1: Jenkins Server Setup

### Install Jenkins
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Install Required Tools
```bash
# Install Maven
sudo apt install maven -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Restart Jenkins to pick up new permissions
sudo systemctl restart jenkins
```

## 🔧 Step 2: Jenkins Configuration

### 1. Initial Setup
1. Open Jenkins: `http://your-jenkins-server:8080`
2. Use initial password from previous step
3. Install suggested plugins
4. Create admin user

### 2. Install Additional Plugins
Go to **Manage Jenkins → Manage Plugins → Available**:
- Docker Pipeline
- Pipeline: Stage View
- Blue Ocean
- Checkstyle
- SpotBugs
- JUnit
- Git Parameter
- Workspace Cleanup
- Build Timeout

### 3. Configure Global Tools
**Manage Jenkins → Global Tool Configuration**:

#### Maven Configuration
- Name: `Maven-3.8`
- Install automatically: ✅
- Version: `3.8.6`

#### JDK Configuration  
- Name: `Java-17`
- JAVA_HOME: `/usr/lib/jvm/java-17-openjdk-amd64`

#### Docker Configuration
- Name: `Docker`
- Installation root: `/usr/bin/docker`

## 🔐 Step 3: Credentials Setup

**Manage Jenkins → Manage Credentials → System → Global credentials**:

### 1. Docker Hub Credentials
- Kind: `Username with password`
- ID: `docker-hub-credentials`
- Username: Your Docker Hub username
- Password: Your Docker Hub token/password

### 2. PostgreSQL Credentials
- Kind: `Username with password`
- ID: `postgres-credentials`
- Username: `libraryuser`
- Password: `librarypass123`

### 3. SSH Key for Deployment (if needed)
- Kind: `SSH Username with private key`
- ID: `deployment-server-ssh`
- Username: Deployment server username
- Private Key: SSH private key for deployment server

## 📝 Step 4: Create Jenkins Pipeline Job

### 1. Create New Job
1. **New Item** → **Pipeline**
2. Job name: `library-management-pipeline`

### 2. Configure Pipeline
#### General Settings:
- ✅ **GitHub project**: `https://github.com/your-username/library-management`
- ✅ **This project is parameterized**:
  - String Parameter: `DOCKER_IMAGE_TAG` (default: `latest`)
  - Choice Parameter: `DEPLOY_ENVIRONMENT` (choices: `staging`, `production`)

#### Build Triggers:
- ✅ **GitHub hook trigger for GITScm polling**
- ✅ **Poll SCM**: `H/5 * * * *` (every 5 minutes)

#### Pipeline Definition:
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: Your repository URL
- **Branch**: `*/main`
- **Script Path**: `jenkins/Jenkinsfile`

## 🔧 Step 5: Deployment Server Setup

### Install Docker & Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# Create deployment directory
sudo mkdir -p /opt/library-management
sudo chown deploy:deploy /opt/library-management
```

### Setup SSH Access
```bash
# On Jenkins server, generate SSH key
ssh-keygen -t rsa -b 4096 -C "jenkins@your-domain.com"

# Copy public key to deployment server
ssh-copy-id deploy@your-deployment-server

# Test connection
ssh deploy@your-deployment-server "docker --version"
```

## 🐳 Step 6: Docker Registry Setup

### Option 1: Docker Hub (Recommended for learning)
1. Create account at https://hub.docker.com
2. Create repository: `your-username/library-management`
3. Generate access token: **Account Settings → Security → New Access Token**

### Option 2: Private Registry
```bash
# Run private registry
docker run -d -p 5000:5000 --name registry registry:2

# Configure Docker to use insecure registry (for testing)
echo '{"insecure-registries": ["your-registry-server:5000"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

## 📊 Step 7: Monitoring & Notifications Setup

### Slack Integration (Optional)
1. Install **Slack Notification** plugin
2. Create Slack app and webhook
3. Configure in **Manage Jenkins → Configure System → Slack**

### Email Notifications
Configure SMTP in **Manage Jenkins → Configure System → Extended E-mail Notification**

## 🚀 Step 8: Pipeline Workflow

### Automated Trigger Flow:
```
1. Developer pushes code to GitHub
2. GitHub webhook triggers Jenkins
3. Jenkins runs pipeline:
   ├── Checkout code
   ├── Run tests
   ├── Code quality analysis
   ├── Build application
   ├── Build Docker image
   ├── Security scan
   ├── Push to registry
   └── Deploy to staging/production
4. Notifications sent on success/failure
```

### Manual Trigger:
1. Go to Jenkins job
2. **Build with Parameters**
3. Select branch and environment
4. Click **Build**

## 🔧 Step 9: Pipeline Customization

### Environment-specific Deployments
Update `Jenkinsfile` for your environment:

```groovy
// Add environment-specific configuration
environment {
    STAGING_SERVER = '192.168.1.100'
    PRODUCTION_SERVER = '192.168.1.200'
    DOCKER_IMAGE = 'baoquoc/library-management'
}
```

### Database Migration
Add database migration stage:

```groovy
stage('Database Migration') {
    steps {
        script {
            sh '''
                # Run database migrations
                docker run --rm --network host \
                  ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                  java -jar app.jar --spring.profiles.active=migration
            '''
        }
    }
}
```

## 📋 Step 10: Testing the Pipeline

### 1. Verify Jenkins Setup
```bash
# Check Jenkins status
sudo systemctl status jenkins

# Check Jenkins logs
sudo journalctl -u jenkins -f
```

### 2. Test Pipeline
1. Make a small change to your code
2. Push to repository
3. Monitor Jenkins dashboard
4. Check each stage execution
5. Verify deployment

### 3. Troubleshooting Common Issues

#### Docker Permission Issues:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### Maven Build Failures:
```bash
# Check Java version
java -version
mvn -version

# Clean Maven cache
rm -rf ~/.m2/repository
```

#### Network Issues:
```bash
# Test connectivity
curl -I https://index.docker.io/v1/
ping your-deployment-server
```

## 📈 Step 11: Advanced Features

### Blue-Green Deployment
```groovy
stage('Blue-Green Deploy') {
    steps {
        script {
            // Deploy to blue environment
            sh 'docker-compose -f docker-compose.blue.yml up -d'
            
            // Health check
            sh 'curl -f http://blue.your-domain.com/actuator/health'
            
            // Switch traffic
            sh 'nginx -s reload'  // Update load balancer
            
            // Cleanup green environment
            sh 'docker-compose -f docker-compose.green.yml down'
        }
    }
}
```

### Rolling Updates
```groovy
stage('Rolling Update') {
    steps {
        script {
            // Update containers one by one
            sh '''
                for i in {1..3}; do
                    docker service update --image ${DOCKER_IMAGE}:${BUILD_NUMBER} library-app-$i
                    sleep 30
                done
            '''
        }
    }
}
```

## 🎯 Best Practices

### 1. Security
- Use least privilege principle
- Store secrets in Jenkins credentials
- Scan images for vulnerabilities
- Use non-root containers

### 2. Performance
- Use multi-stage Docker builds
- Cache Maven dependencies
- Parallel job execution
- Clean up old images

### 3. Reliability
- Implement health checks
- Add rollback procedures
- Monitor application metrics
- Set up alerts

### 4. Compliance
- Version everything
- Audit deployments
- Document changes
- Regular security updates

## 📞 Support & Monitoring

### Jenkins Monitoring
- Monitor disk space: `/var/lib/jenkins`
- Check build queue length
- Monitor resource usage
- Set up alerts for failed builds

### Application Monitoring
- Use ELK stack for log aggregation
- Set up Grafana dashboards
- Monitor response times
- Track error rates

---

## 🎉 Congratulations!

You now have a complete Jenkins-based CI/CD pipeline that provides:
- ✅ Automated builds on code changes
- ✅ Comprehensive testing and quality checks
- ✅ Docker containerization
- ✅ Security scanning
- ✅ Automated deployments
- ✅ Monitoring and notifications

This setup gives you hands-on experience with enterprise-grade CI/CD practices and prepares you for real-world DevOps scenarios.
