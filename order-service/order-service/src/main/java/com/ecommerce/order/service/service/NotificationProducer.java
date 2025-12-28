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
