#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "ROOT=$ROOT"

# ---- helpers ----
ensure_dirs() { mkdir -p "$@"; }   # <-- IMPORTANT: supports multiple dirs
write_file() { local p="$1"; shift; ensure_dirs "$(dirname "$p")"; cat > "$p" <<EOF
$*
EOF
}

SPRING_BOOT_VER="3.4.1"
SPRING_CLOUD_VER="2024.0.1"

# Detect module path (module/module OR module)
ctx() {
  local name="$1"
  if [[ -d "$ROOT/$name/$name" ]]; then echo "$ROOT/$name/$name"; return; fi
  if [[ -d "$ROOT/$name" ]]; then echo "$ROOT/$name"; return; fi
  echo ""
}

CLIENT_CTX="$(ctx client-service)"
PAYMENT_CTX="$(ctx payment-service)"
BATCH_CTX="$(ctx batch-service)"
GATEWAY_CTX="$(ctx api-gateway)"

if [[ -z "$CLIENT_CTX" || -z "$PAYMENT_CTX" || -z "$BATCH_CTX" || -z "$GATEWAY_CTX" ]]; then
  echo "ERROR: one of modules not found (client/payment/batch/gateway)."
  echo "CLIENT_CTX=$CLIENT_CTX"
  echo "PAYMENT_CTX=$PAYMENT_CTX"
  echo "BATCH_CTX=$BATCH_CTX"
  echo "GATEWAY_CTX=$GATEWAY_CTX"
  exit 1
fi

echo "CLIENT_CTX=$CLIENT_CTX"
echo "PAYMENT_CTX=$PAYMENT_CTX"
echo "BATCH_CTX=$BATCH_CTX"
echo "GATEWAY_CTX=$GATEWAY_CTX"

# ---- common pom ----
write_pom() {
  local MOD="$1" GROUP="$2" ART="$3" EXTRA_DEPS="$4"
  cat > "$MOD/pom.xml" <<EOF
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>${GROUP}</groupId>
  <artifactId>${ART}</artifactId>
  <version>1.0.0</version>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>${SPRING_BOOT_VER}</version>
  </parent>

  <properties>
    <java.version>17</java.version>
    <spring-cloud.version>${SPRING_CLOUD_VER}</spring-cloud.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>

    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>

    <dependency>
      <groupId>io.github.resilience4j</groupId>
      <artifactId>resilience4j-spring-boot3</artifactId>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>

    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    ${EXTRA_DEPS}

    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-dependencies</artifactId>
        <version>\${spring-cloud.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
EOF
}

write_app_yml() {
  local MOD="$1" APP="$2" PORT="$3"
  write_file "$MOD/src/main/resources/application.yml" \
"server:
  port: ${PORT}

spring:
  application:
    name: ${APP}
  datasource:
    url: jdbc:postgresql://postgres:5432/ecommerce
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
  config:
    import: optional:configserver:http://config-server:8888

eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    preferIpAddress: true

management:
  endpoints:
    web:
      exposure:
        include: '*'
"
}

# ============================================================
# 1) CLIENT SERVICE (CRUD)
# package base = com.ecommerce.client.service  (matches your tree) :contentReference[oaicite:5]{index=5}
# ============================================================
echo "==> Rebuilding client-service..."
write_pom "$CLIENT_CTX" "com.ecommerce.client.service" "client-service" ""

write_app_yml "$CLIENT_CTX" "client-service" "8084"

BASE_CS="$CLIENT_CTX/src/main/java/com/ecommerce/client/service"
ensure_dirs "$BASE_CS/controller" "$BASE_CS/model" "$BASE_CS/repository" "$BASE_CS/dto"

write_file "$BASE_CS/MainApplication.java" \
"package com.ecommerce.client.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MainApplication {
  public static void main(String[] args) {
    SpringApplication.run(MainApplication.class, args);
  }
}
"

write_file "$BASE_CS/model/Client.java" \
"package com.ecommerce.client.service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = \"clients\")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Client {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String fullName;

  @Column(nullable = false, unique = true)
  private String email;

  private String phone;
  private String address;

  @Column(nullable = false)
  private Instant createdAt;
}
"

write_file "$BASE_CS/dto/ClientRequest.java" \
"package com.ecommerce.client.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
  @NotBlank String fullName,
  @NotBlank @Email String email,
  String phone,
  String address
) {}
"

write_file "$BASE_CS/repository/ClientRepository.java" \
"package com.ecommerce.client.service.repository;

import com.ecommerce.client.service.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
  boolean existsByEmail(String email);
}
"

write_file "$BASE_CS/controller/ClientController.java" \
"package com.ecommerce.client.service.controller;

import com.ecommerce.client.service.dto.ClientRequest;
import com.ecommerce.client.service.model.Client;
import com.ecommerce.client.service.repository.ClientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping(\"/api/clients\")
public class ClientController {

  private final ClientRepository repo;

  public ClientController(ClientRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public List<Client> all() { return repo.findAll(); }

  @GetMapping(\"/{id}\")
  public Client one(@PathVariable Long id) {
    return repo.findById(id).orElseThrow(() -> new RuntimeException(\"Client not found\"));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Client create(@Valid @RequestBody ClientRequest req) {
    if (repo.existsByEmail(req.email())) throw new RuntimeException(\"Email already exists\");
    Client c = Client.builder()
      .fullName(req.fullName())
      .email(req.email())
      .phone(req.phone())
      .address(req.address())
      .createdAt(Instant.now())
      .build();
    return repo.save(c);
  }

  @PutMapping(\"/{id}\")
  public Client update(@PathVariable Long id, @Valid @RequestBody ClientRequest req) {
    Client c = repo.findById(id).orElseThrow(() -> new RuntimeException(\"Client not found\"));
    c.setFullName(req.fullName());
    c.setPhone(req.phone());
    c.setAddress(req.address());
    return repo.save(c);
  }

  @DeleteMapping(\"/{id}\")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
"

# ============================================================
# 2) PAYMENT SERVICE (logic: pay -> update order status -> send notification)
# package base = com.ecommerce.payment.service :contentReference[oaicite:6]{index=6}
# ============================================================
echo "==> Rebuilding payment-service..."
write_pom "$PAYMENT_CTX" "com.ecommerce.payment.service" "payment-service" ""

write_app_yml "$PAYMENT_CTX" "payment-service" "8086"

BASE_PS="$PAYMENT_CTX/src/main/java/com/ecommerce/payment/service"
ensure_dirs "$BASE_PS/controller" "$BASE_PS/model" "$BASE_PS/repository" "$BASE_PS/dto" "$BASE_PS/config" "$BASE_PS/client" "$BASE_PS/service"

write_file "$BASE_PS/MainApplication.java" \
"package com.ecommerce.payment.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MainApplication {
  public static void main(String[] args) {
    SpringApplication.run(MainApplication.class, args);
  }
}
"

write_file "$BASE_PS/model/Payment.java" \
"package com.ecommerce.payment.service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = \"payments\")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long orderId;

  @Column(nullable = false)
  private Double amount;

  @Column(nullable = false)
  private String method; // CARD/CASH...

  @Column(nullable = false)
  private String status; // PAID/FAILED

  @Column(nullable = false)
  private Instant createdAt;
}
"

write_file "$BASE_PS/dto/PaymentRequest.java" \
"package com.ecommerce.payment.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
  @NotNull Long orderId,
  @NotNull @Min(0) Double amount,
  @NotBlank String method
) {}
"

write_file "$BASE_PS/repository/PaymentRepository.java" \
"package com.ecommerce.payment.service.repository;

import com.ecommerce.payment.service.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findByOrderId(Long orderId);
}
"

# Feign client to order-service: PUT /api/orders/{id}/status  (matches frontend call style) :contentReference[oaicite:7]{index=7}
write_file "$BASE_PS/client/OrderClient.java" \
"package com.ecommerce.payment.service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = \"order-service\")
public interface OrderClient {
  @PutMapping(\"/api/orders/{id}/status\")
  Object updateStatus(@PathVariable(\"id\") Long id, @RequestBody StatusReq req);

  record StatusReq(String status) {}
}
"

# Rabbit config (same exchange/queue naming as your order-service uses) :contentReference[oaicite:8]{index=8}
write_file "$BASE_PS/config/RabbitMQConfig.java" \
"package com.ecommerce.payment.service.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  @Bean
  public DirectExchange notificationExchange() {
    return new DirectExchange(\"notificationExchange\");
  }

  @Bean
  public Queue notificationQueue() {
    return new Queue(\"notificationQueue\", true);
  }

  @Bean
  public Binding binding(Queue notificationQueue, DirectExchange notificationExchange) {
    return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(\"notificationQueue\");
  }
}
"

write_file "$BASE_PS/service/PaymentService.java" \
"package com.ecommerce.payment.service.service;

import com.ecommerce.payment.service.client.OrderClient;
import com.ecommerce.payment.service.model.Payment;
import com.ecommerce.payment.service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaymentRepository repo;
  private final OrderClient orderClient;
  private final RabbitTemplate rabbitTemplate;

  public Payment pay(Long orderId, Double amount, String method) {
    // 1) save payment
    Payment p = Payment.builder()
      .orderId(orderId)
      .amount(amount)
      .method(method)
      .status(\"PAID\")
      .createdAt(Instant.now())
      .build();
    Payment saved = repo.save(p);

    // 2) update order status -> PAID
    try {
      orderClient.updateStatus(orderId, new OrderClient.StatusReq(\"PAID\"));
    } catch (Exception e) {
      // don't fail payment, but mark info in logs
      System.err.println(\"⚠️ Failed to update order status for orderId=\" + orderId + \": \" + e.getMessage());
    }

    // 3) async notification (email/sms simulated by your notification-service)
    try {
      NotificationMessage msg = new NotificationMessage(
        List.of(\"admin@demo.com\"), // keep simple for demo (you can replace later)
        \"+212000000000\",
        \"✅ Payment received for Order #\" + orderId + \" (amount=\" + amount + \", method=\" + method + \")\"
      );

      rabbitTemplate.convertAndSend(
        \"notificationExchange\",
        \"notificationQueue\",
        msg
      );
    } catch (Exception e) {
      System.err.println(\"⚠️ Failed to send payment notification: \" + e.getMessage());
    }

    return saved;
  }

  public java.util.List<Payment> all() { return repo.findAll(); }
  public java.util.List<Payment> byOrder(Long orderId) { return repo.findByOrderId(orderId); }

  public record NotificationMessage(java.util.List<String> toList, String phone, String text) {}
}
"

write_file "$BASE_PS/controller/PaymentController.java" \
"package com.ecommerce.payment.service.controller;

import com.ecommerce.payment.service.dto.PaymentRequest;
import com.ecommerce.payment.service.model.Payment;
import com.ecommerce.payment.service.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(\"/api/payments\")
public class PaymentController {

  private final PaymentService service;

  public PaymentController(PaymentService service) {
    this.service = service;
  }

  @GetMapping
  public List<Payment> all() { return service.all(); }

  @GetMapping(\"/by-order/{orderId}\")
  public List<Payment> byOrder(@PathVariable Long orderId) { return service.byOrder(orderId); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Payment pay(@Valid @RequestBody PaymentRequest req) {
    return service.pay(req.orderId(), req.amount(), req.method());
  }
}
"

# ============================================================
# 3) BATCH SERVICE (minimal but REAL Spring Batch + scheduled trigger)
# package base = com.ecommerce.batch.service :contentReference[oaicite:9]{index=9}
# ============================================================
echo "==> Rebuilding batch-service..."
write_pom "$BATCH_CTX" "com.ecommerce.batch.service" "batch-service" \
"<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-batch</artifactId>
</dependency>"

write_app_yml "$BATCH_CTX" "batch-service" "8087"

BASE_BS="$BATCH_CTX/src/main/java/com/ecommerce/batch/service"
ensure_dirs "$BASE_BS/config" "$BASE_BS/controller"

write_file "$BASE_BS/MainApplication.java" \
"package com.ecommerce.batch.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MainApplication {
  public static void main(String[] args) {
    SpringApplication.run(MainApplication.class, args);
  }
}
"

write_file "$BASE_BS/config/BatchConfig.java" \
"package com.ecommerce.batch.service.config;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class BatchConfig {

  @Bean
  public Step nightlyStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
    return new StepBuilder(\"nightlyStep\", jobRepository)
      .tasklet((contribution, chunkContext) -> {
        System.out.println(\"✅ Nightly batch executed (placeholder for pending orders processing)\");
        return RepeatStatus.FINISHED;
      }, txManager)
      .build();
  }

  @Bean
  public Job nightlyOrdersJob(JobRepository jobRepository, Step nightlyStep) {
    return new JobBuilder(\"nightlyOrdersJob\", jobRepository)
      .start(nightlyStep)
      .build();
  }
}
"

write_file "$BASE_BS/controller/BatchController.java" \
"package com.ecommerce.batch.service.controller;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(\"/api/batch\")
public class BatchController {

  private final JobLauncher launcher;
  private final Job nightlyOrdersJob;

  public BatchController(JobLauncher launcher, Job nightlyOrdersJob) {
    this.launcher = launcher;
    this.nightlyOrdersJob = nightlyOrdersJob;
  }

  @PostMapping(\"/run\")
  public String run() throws Exception {
    launcher.run(nightlyOrdersJob,
      new JobParametersBuilder().addLong(\"time\", System.currentTimeMillis()).toJobParameters()
    );
    return \"Batch triggered ✅\";
  }
}
"

# ============================================================
# 4) FIX api-gateway application.yml (remove '- \\1' + merge spring blocks)
# Your current gateway yml is broken :contentReference[oaicite:10]{index=10} :contentReference[oaicite:11]{index=11}
# ============================================================
echo "==> Fixing gateway application.yml..."
GW_YML="$GATEWAY_CTX/src/main/resources/application.yml"

cat > "$GW_YML" <<'YML'
server:
  port: 8080

spring:
  application:
    name: api-gateway

  cloud:
    compatibility-verifier:
      enabled: false

    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true

      routes:
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - PreserveHostHeader=true

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - PreserveHostHeader=true

        - id: client-service
          uri: lb://client-service
          predicates:
            - Path=/api/clients/**
          filters:
            - PreserveHostHeader=true

        - id: payment-service
          uri: lb://payment-service
          predicates:
            - Path=/api/payments/**
          filters:
            - PreserveHostHeader=true

        - id: batch-service
          uri: lb://batch-service
          predicates:
            - Path=/api/batch/**
          filters:
            - PreserveHostHeader=true

        - id: notification-service
          uri: lb://notification-service
          predicates:
            - Path=/api/notifications/**
          filters:
            - PreserveHostHeader=true

      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOriginPatterns: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true

  config:
    import: optional:configserver:http://config-server:8888

eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    prefer-ip-address: true

management:
  endpoints:
    web:
      exposure:
        include: "*"
YML

echo "✅ Gateway fixed."

echo "✅ Done."

