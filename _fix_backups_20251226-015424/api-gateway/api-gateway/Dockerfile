# Old
# FROM openjdk:17-jdk-slim

# ✅ New (modern equivalent)
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]

