package com.ecommerce.notification.service.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final RabbitTemplate rabbitTemplate;

    public NotificationController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping("/send")
    public String send(@RequestBody String message) {
        rabbitTemplate.convertAndSend("notification.queue", message);
        return "Notification sent ✅";
    }
}
