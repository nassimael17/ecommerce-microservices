package com.ecommerce.notification.service.service;

import lombok.RequiredArgsConstructor;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendNotificationEmail(List<String> toList, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toList.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(text, false); // false = plain text
            
            mailSender.send(message);
            System.out.println("📧 Email (UTF-8) sent to " + toList);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send UTF-8 email: " + e.getMessage());
        }
    }
}
