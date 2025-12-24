package com.ecommerce.notification.service.listener;

import com.ecommerce.notification.service.model.NotificationMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationListener {

    @RabbitListener(queues = "notificationQueue")
    public void receiveMessage(NotificationMessage notification) {
        log.info("📩 New Notification Received!");
        log.info("To Email: {}", notification.getRecipientEmail());
        log.info("To Phone: {}", notification.getRecipientPhone());
        log.info("Message: {}", notification.getMessage());
        log.info("✅ Simulated Email/SMS sent successfully!");
    }
}
