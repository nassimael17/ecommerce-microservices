package com.ecommerce.notification.service.listener;

import com.ecommerce.notification.service.model.NotificationMessage;
import com.ecommerce.notification.service.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final EmailService emailService;

    @RabbitListener(queues = "notificationQueue")
    public void receiveMessage(NotificationMessage notification) {
        log.info("📩 New Notification Received!");
        log.info("To Email(s): {}", notification.getRecipientEmails());
        log.info("Message: {}", notification.getMessage());

        try {
            if (notification.getRecipientEmails() != null && !notification.getRecipientEmails().isEmpty()) {
                emailService.sendNotificationEmail(
                        notification.getRecipientEmails(),
                        "📦 New Order Notification",
                        notification.getMessage()
                );
                log.info("✅ Email sent successfully to {}", notification.getRecipientEmails());
            } else {
                log.warn("⚠️ No recipient email provided — skipping email sending.");
            }
        } catch (Exception e) {
            log.error("❌ Failed to send email: {}", e.getMessage());
        }
    }
}
