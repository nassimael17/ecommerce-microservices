package com.ecommerce.notification.service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendNotificationEmail(List<String> toList, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toList.toArray(new String[0]));
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
        System.out.println("📧 Email sent to " + toList);
    }
}
