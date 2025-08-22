# Multi-stage build for Spring Boot application
# Stage 1: Build stage với Maven
FROM maven:3.8-openjdk-17 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml trước để cache Maven dependencies
COPY pom.xml .

# Download dependencies (cache layer này khi pom.xml không thay đổi)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application (skip tests để build nhanh hơn)
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage với JRE nhẹ hơn
# Runtime stage
FROM openjdk:17-jdk-slim

# Tạo user non-root để chạy app (security best practice)
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Set working directory
WORKDIR /app

# Create log directories
RUN mkdir -p /app/logstash/pipeline && chown -R spring:spring /app

# Copy JAR file từ build stage
COPY --from=builder /app/target/*.jar app.jar

# Chown file để spring user có thể đọc
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring

# Expose port 8080
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM tuning cho container
ENV JAVA_OPTS="-Xms256m -Xmx512m -Djava.security.egd=file:/dev/./urandom"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
