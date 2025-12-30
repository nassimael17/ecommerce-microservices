# E-commerce Microservices - Technical Documentation

## 1. Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Angular[Angular Dashboard<br/>Port 4200]
    end
    
    subgraph "API Layer"
        Gateway[API Gateway<br/>Port 8085]
    end
    
    subgraph "Infrastructure Services"
        Config[Config Server<br/>Port 8888]
        Eureka[Eureka Server<br/>Port 8761]
    end
    
    subgraph "Business Services"
        Product[Product Service<br/>Port 8081]
        Order[Order Service<br/>Port 8082]
        Client[Client Service<br/>Port 8084]
        Payment[Payment Service<br/>Port 8086]
        Notification[Notification Service<br/>Port 8083]
        Batch[Batch Service<br/>Port 8087]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Port 5432)]
        RabbitMQ[RabbitMQ<br/>Ports 5672, 15672]
    end
    
    Angular -->|HTTP| Gateway
    Gateway -->|Load Balance| Product
    Gateway -->|Load Balance| Order
    Gateway -->|Load Balance| Client
    Gateway -->|Load Balance| Payment
    Gateway -->|Load Balance| Notification
    
    Product -->|Register| Eureka
    Order -->|Register| Eureka
    Client -->|Register| Eureka
    Payment -->|Register| Eureka
    Notification -->|Register| Eureka
    Batch -->|Register| Eureka
    Gateway -->|Discover| Eureka
    
    Product -->|Config| Config
    Order -->|Config| Config
    Client -->|Config| Config
    Payment -->|Config| Config
    Notification -->|Config| Config
    Batch -->|Config| Config
    Gateway -->|Config| Config
    
    Product -->|JPA| Postgres
    Order -->|JPA| Postgres
    Client -->|JPA| Postgres
    Payment -->|JPA| Postgres
    Batch -->|JPA| Postgres
    
    Order -->|Publish Events| RabbitMQ
    Notification -->|Subscribe| RabbitMQ
    
    Order -.->|OpenFeign + Circuit Breaker| Product
    Order -.->|OpenFeign| Client
    Batch -.->|OpenFeign| Order
```

## 2. Main API Endpoints

### API Gateway (Port 8085)
All requests go through the gateway with prefix `/api`

### Product Service
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Order Service
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order (triggers notification)
- `PUT /api/orders/{id}` - Update order status (triggers notification)
- `DELETE /api/orders/{id}` - Cancel order

### Client Service
- `GET /api/clients` - List all clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Register new client
- `PUT /api/clients/{id}` - Update client
- `POST /api/clients/login` - Authenticate client

### Payment Service
- `GET /api/payments` - List all payments
- `GET /api/payments/{id}` - Get payment by ID
- `POST /api/payments` - Process payment
- `GET /api/payments/order/{orderId}` - Get payments for order

### Notification Service
- `GET /api/notifications` - List all notifications
- `GET /api/notifications/client/{clientId}` - Get client notifications

## 3. Order Placement Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User (Angular)
    participant G as API Gateway
    participant O as Order Service
    participant P as Product Service
    participant C as Client Service
    participant Pay as Payment Service
    participant R as RabbitMQ
    participant N as Notification Service
    
    U->>G: POST /api/orders
    G->>O: Create Order Request
    
    O->>C: Verify Client (OpenFeign)
    C-->>O: Client Valid
    
    O->>P: Check Product Availability (OpenFeign + Circuit Breaker)
    alt Product Service Available
        P-->>O: Product Available
    else Product Service Down
        O-->>O: Circuit Breaker Fallback
        O-->>G: Service Unavailable
        G-->>U: Error Response
    end
    
    O->>O: Create Order (Status: PENDING)
    O->>Postgres: Save Order
    
    O->>R: Publish Order Created Event
    O-->>G: Order Created
    G-->>U: Order Confirmation
    
    R->>N: Order Created Event
    N->>N: Send Email Notification
    N->>Postgres: Save Notification Record
    
    U->>G: POST /api/payments
    G->>Pay: Process Payment
    Pay->>Postgres: Save Payment
    Pay-->>G: Payment Success
    
    G->>O: Update Order Status (CONFIRMED)
    O->>R: Publish Order Confirmed Event
    R->>N: Order Confirmed Event
    N->>N: Send Confirmation Email
```

## 4. Spring Batch - Nightly Order Processing

### Batch Job Configuration
- **Service**: batch-service (Port 8087)
- **Schedule**: Nightly at 2:00 AM (configurable via cron expression)
- **Purpose**: Process all PENDING orders in batch

### Batch Job Flow
1. **Reader**: Reads all orders with status = "PENDING" from database
2. **Processor**: 
   - Validates order details
   - Checks product availability via OpenFeign
   - Calculates totals
   - Updates order status to "PROCESSING"
3. **Writer**: Saves processed orders back to database
4. **Notification**: Publishes batch completion event to RabbitMQ

### Configuration
```yaml
spring:
  batch:
    job:
      enabled: true
    jdbc:
      initialize-schema: always
```

### Cron Expression
```java
@Scheduled(cron = "0 0 2 * * *") // Every day at 2 AM
public void runBatchJob()
```

## 5. Notification System

### Architecture
- **Message Broker**: RabbitMQ (Ports 5672, 15672)
- **Publisher**: Order Service
- **Subscriber**: Notification Service
- **Email**: Gmail SMTP (configured in docker-compose)

### Event Types
1. **ORDER_CREATED** - Sent when new order is placed
2. **ORDER_CONFIRMED** - Sent when payment is successful
3. **ORDER_SHIPPED** - Sent when order is dispatched
4. **ORDER_DELIVERED** - Sent when order is delivered
5. **ORDER_CANCELLED** - Sent when order is cancelled

### RabbitMQ Configuration
```yaml
spring:
  rabbitmq:
    host: rabbitmq
    port: 5672
    username: guest
    password: guest
```

### Queue Configuration
- **Queue Name**: `order-notifications`
- **Exchange**: `order-exchange`
- **Routing Key**: `order.#`

### Email Template
```
Subject: Order Status Update - Order #{orderId}

Dear {customerName},

Your order #{orderId} status has been updated to: {status}

Order Details:
- Products: {productList}
- Total: ${total}
- Date: {date}

Thank you for shopping with us!
```

## 6. Resilience Patterns

### Circuit Breaker (Resilience4J)
Implemented in Order Service when calling Product Service

**Configuration:**
```yaml
resilience4j:
  circuitbreaker:
    instances:
      productService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
```

**States:**
- **CLOSED**: Normal operation
- **OPEN**: Service unavailable, requests fail fast
- **HALF_OPEN**: Testing if service recovered

### Fallback Strategy
When Product Service is unavailable:
1. Return cached product data (if available)
2. Allow order creation with manual verification flag
3. Queue order for later processing

## 7. Service Discovery

All services register with Eureka Server on startup:
- **Eureka Dashboard**: http://localhost:8761
- **Health Check Interval**: 30 seconds
- **Lease Renewal Interval**: 30 seconds

## 8. Configuration Management

Centralized configuration via Config Server:
- **Config Server**: Port 8888
- **Profile**: native (file-based)
- **Location**: `/config-repo` directory
- **Refresh**: Dynamic refresh supported via Spring Cloud Bus (optional)
