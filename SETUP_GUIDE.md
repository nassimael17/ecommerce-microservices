# 🚀 Project Setup Guide

To run this project on a new laptop, you will need to install the following tools:

## 1. Prerequisites (Install these first)

### ☕ Java Development Kit (JDK)
- **Version:** JDK 17 or higher
- **Download:** [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)

### 🐳 Docker & Docker Compose
- **Required** for running the database (PostgreSQL) and message broker (RabbitMQ).
- **Download:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 📦 Node.js & npm
- **Required** for the Angular Frontend.
- **Version:** Node v20 (LTS recommended)
- **Download:** [Node.js](https://nodejs.org/)

### 🅰️ Angular CLI
- Open your terminal and run:
  ```bash
  npm install -g @angular/cli
  ```

### 🐘 Maven (Optional but recommended)
- Usually included with IntelliJ IDEA or Eclipse, but good to have installed.
- **Download:** [Apache Maven](https://maven.apache.org/download.cgi)

---

## 2. Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/nassimael17/ecommerce-microservices.git
    cd ecommerce-microservices
    ```

2.  **Start Infrastructure (Docker):**
    ```bash
    docker-compose up -d
    ```
    *Wait for a minute for Postgres and RabbitMQ to be ready.*

3.  **Run Backend Services:**
    You need to run these services in order (or all at once in your IDE):
    1.  `config-server`
    2.  `eureka-server` (Wait for it to start fully)
    3.  `api-gateway`
    4.  `product-service`
    5.  `order-service`
    6.  `payment-service`
    7.  `notification-service`
    8.  `client-service`

    *Tip: In IntelliJ IDEA, you can create a "Compound" run configuration to start them all.*

4.  **Run Frontend:**
    ```bash
    cd ecommerce-dashboard
    npm install
    npm start
    ```

5.  **Access the App:**
    Open `http://localhost:4200` in your browser.

## 3. Important Notes
- **Email Credentials:** The notification service is configured in `docker-compose.yml`. If you pull the code on a new machine, `docker-compose up -d` will use the credentials saved there.
