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
