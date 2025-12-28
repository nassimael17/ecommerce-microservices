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
