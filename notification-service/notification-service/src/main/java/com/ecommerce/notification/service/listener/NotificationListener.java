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
