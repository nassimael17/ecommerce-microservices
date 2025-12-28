package com.ecommerce.notification.service.controller;

import com.ecommerce.notification.service.store.NotificationStore;
import com.ecommerce.notification.service.model.NotificationMessage;
import com.ecommerce.notification.service.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final RabbitTemplate rabbitTemplate;
    private final NotificationStore store;

    public NotificationController(RabbitTemplate rabbitTemplate, NotificationStore store) {
        this.rabbitTemplate = rabbitTemplate;
        this.store = store;
    }

    @GetMapping
    public List<NotificationStore.Item> all() {
        return store.all();
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
