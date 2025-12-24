package com.ecommerce.notification.service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private String recipientEmail;
    private String recipientPhone;
    private String message;
}
