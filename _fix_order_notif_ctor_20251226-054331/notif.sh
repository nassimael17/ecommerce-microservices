#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ts(){ date +"%Y%m%d-%H%M%S"; }
BACKUP="$ROOT/_fix_notif_order_only_$(ts)"
mkdir -p "$BACKUP"

echo "==> ROOT:   $ROOT"
echo "==> BACKUP: $BACKUP"

backup_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp -a "$f" "$BACKUP/$f"
  fi
}

write_file() {
  local f="$1"
  backup_file "$f"
  mkdir -p "$(dirname "$f")"
  cat > "$f"
}

need() {
  [[ -f "$1" ]] || { echo "❌ Missing file: $1"; exit 1; }
}

# ------------------------------------------------------------
# Paths (ONLY order-service + notification-service)
# ------------------------------------------------------------
ORDER_RABBIT="$ROOT/order-service/order-service/src/main/java/com/ecommerce/order/service/config/RabbitMQConfig.java"
ORDER_MSG="$ROOT/order-service/order-service/src/main/java/com/ecommerce/order/service/model/NotificationMessage.java"
ORDER_PROD="$ROOT/order-service/order-service/src/main/java/com/ecommerce/order/service/service/NotificationProducer.java"

NOTIF_RABBIT="$ROOT/notification-service/notification-service/src/main/java/com/ecommerce/notification/service/config/RabbitMQConfig.java"
NOTIF_MSG="$ROOT/notification-service/notification-service/src/main/java/com/ecommerce/notification/service/model/NotificationMessage.java"
NOTIF_LISTENER="$ROOT/notification-service/notification-service/src/main/java/com/ecommerce/notification/service/listener/NotificationListener.java"
NOTIF_CTRL="$ROOT/notification-service/notification-service/src/main/java/com/ecommerce/notification/service/controller/NotificationController.java"
NOTIF_APPYML="$ROOT/notification-service/notification-service/src/main/resources/application.yml"

need "$ORDER_RABBIT"
need "$ORDER_MSG"
need "$ORDER_PROD"
need "$NOTIF_RABBIT"
need "$NOTIF_MSG"
need "$NOTIF_LISTENER"
need "$NOTIF_CTRL"
need "$NOTIF_APPYML"

echo "==> Patch: order-service RabbitMQConfig (JSON converter + RabbitTemplate)"
write_file "$ORDER_RABBIT" <<'EOF'
package com.ecommerce.order.service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "notificationExchange";
    public static final String QUEUE_NAME = "notificationQueue";

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue notificationQueue, DirectExchange notificationExchange) {
        // routing key == queue name
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(QUEUE_NAME);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                        Jackson2JsonMessageConverter converter) {
        RabbitTemplate t = new RabbitTemplate(connectionFactory);
        t.setMessageConverter(converter);
        return t;
    }
}
EOF

echo "==> Patch: order-service NotificationMessage (align JSON fields with notification-service)"
write_file "$ORDER_MSG" <<'EOF'
package com.ecommerce.order.service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * IMPORTANT: This model must match notification-service model field names
 * so Jackson JSON conversion works across RabbitMQ.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private List<String> to;      // emails
    private String phone;         // optional (simulated SMS)
    private String subject;       // email subject
    private String message;       // email body
}
EOF

echo "==> Patch: order-service NotificationProducer (send to exchange with routingKey; never break order if RabbitMQ is down)"
write_file "$ORDER_PROD" <<'EOF'
package com.ecommerce.order.service.service;

import com.ecommerce.order.service.config.RabbitMQConfig;
import com.ecommerce.order.service.model.NotificationMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public NotificationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendNotification(NotificationMessage message) {
        try {
            // Send JSON to direct exchange, routing key == queue name
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.QUEUE_NAME,
                    message
            );
            System.out.println("📤 Notification message sent to RabbitMQ (JSON).");
        } catch (Exception e) {
            // Do NOT fail the order flow if RabbitMQ is temporarily down
            System.out.println("⚠️ Failed to publish notification to RabbitMQ: " + e.getMessage());
        }
    }
}
EOF

echo "==> Patch: notification-service RabbitMQConfig (ensure RabbitTemplate uses JSON converter)"
# We keep your existing structure but guarantee RabbitTemplate bean
# (safe even if Spring creates one; this forces JSON converter)
# We'll rewrite fully for consistency.
write_file "$NOTIF_RABBIT" <<'EOF'
package com.ecommerce.notification.service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "notificationExchange";
    public static final String QUEUE_NAME = "notificationQueue";

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(QUEUE_NAME);
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setAutoStartup(true);
        return admin;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter converter
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                        Jackson2JsonMessageConverter converter) {
        RabbitTemplate t = new RabbitTemplate(connectionFactory);
        t.setMessageConverter(converter);
        return t;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void declareQueueWhenReady(ApplicationReadyEvent event) {
        RabbitAdmin admin = event.getApplicationContext().getBean(RabbitAdmin.class);
        admin.declareQueue(notificationQueue());
        admin.declareExchange(notificationExchange());
        admin.declareBinding(binding(notificationQueue(), notificationExchange()));
    }
}
EOF

echo "==> Patch: notification-service NotificationMessage (match order-service)"
write_file "$NOTIF_MSG" <<'EOF'
package com.ecommerce.notification.service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private List<String> to;
    private String phone;
    private String subject;
    private String message;
}
EOF

echo "==> Patch: notification-service NotificationListener (consume JSON + send email)"
# Uses your existing EmailService (list-based) + keeps store behavior
write_file "$NOTIF_LISTENER" <<'EOF'
package com.ecommerce.notification.service.listener;

import com.ecommerce.notification.service.config.RabbitMQConfig;
import com.ecommerce.notification.service.model.NotificationMessage;
import com.ecommerce.notification.service.service.EmailService;
import com.ecommerce.notification.service.store.NotificationStore;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    private final NotificationStore store;
    private final EmailService emailService;

    public NotificationListener(NotificationStore store, EmailService emailService) {
        this.store = store;
        this.emailService = emailService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME, containerFactory = "rabbitListenerContainerFactory")
    public void onMessage(NotificationMessage msg) {
        String subject = (msg != null && msg.getSubject() != null && !msg.getSubject().isBlank())
                ? msg.getSubject()
                : "Notification";

        String text = (msg != null && msg.getMessage() != null) ? msg.getMessage() : "(empty)";
        System.out.println("📥 Notification received: " + text);

        // Store it (UI/debug)
        store.add(new NotificationStore.Item(subject, text,
                msg != null ? msg.getTo() : null,
                msg != null ? msg.getPhone() : null
        ));

        // Send email (if recipients exist)
        try {
            if (msg != null && msg.getTo() != null && !msg.getTo().isEmpty()) {
                emailService.sendNotificationEmail(msg.getTo(), subject, text);
            } else {
                System.out.println("ℹ️ No recipient emails provided; skipping email send.");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Email sending failed: " + e.getMessage());
            // Do not rethrow: we don't want to poison the queue; you can change this later if needed.
        }
    }
}
EOF

echo "==> Patch: notification-service NotificationController (send JSON to same exchange/queue)"
write_file "$NOTIF_CTRL" <<'EOF'
package com.ecommerce.notification.service.controller;

import com.ecommerce.notification.service.config.RabbitMQConfig;
import com.ecommerce.notification.service.model.NotificationMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final RabbitTemplate rabbitTemplate;

    public NotificationController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    // Manual test endpoint (optional) - publishes JSON message to RabbitMQ
    @PostMapping("/send")
    public String send(@RequestBody NotificationMessage message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.QUEUE_NAME,
                message
        );
        return "✅ Published to RabbitMQ: exchange=" + RabbitMQConfig.EXCHANGE_NAME + ", rk=" + RabbitMQConfig.QUEUE_NAME;
    }
}
EOF

echo ""
echo "✅ Done. Patched ONLY order-service + notification-service."
echo "Backups saved in: $BACKUP"
echo ""
echo "NEXT:"
echo "  docker compose up -d --build"
echo ""
echo "TESTS:"
echo "1) Stop notification-service container, create an order => message must stay in queue."
echo "2) Start notification-service again => it consumes and sends email."
echo "3) Stop product-service, create an order => your Resilience4J fallback should trigger as before."
