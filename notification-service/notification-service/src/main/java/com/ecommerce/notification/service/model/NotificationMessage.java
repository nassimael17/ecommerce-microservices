package com.ecommerce.notification.service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private List<String> to;
    private String phone;
    private String subject;
    private String message;
}
