package com.ecommerce.order.service.service;

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
        // The queue name must match NotificationService
        rabbitTemplate.convertAndSend("notificationQueue", message);
        System.out.println("📤 Notification message sent to RabbitMQ!");
    }
}
