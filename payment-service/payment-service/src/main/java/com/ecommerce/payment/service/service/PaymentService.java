package com.ecommerce.payment.service.service;

import com.ecommerce.payment.service.client.OrderClient;
import com.ecommerce.payment.service.model.Payment;
import com.ecommerce.payment.service.dto.PaymentRequest;
import com.ecommerce.payment.service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaymentRepository repo;
  private final OrderClient orderClient;
  private final RabbitTemplate rabbitTemplate;

  public Payment pay(Long orderId, Double amount, PaymentRequest request) {
    // 1) save payment
    Payment p = Payment.builder()
      .orderId(orderId)
      .amount(amount)
      .method(request.method())
      .cardNumber(request.cardNumber())
      .cvv(request.cvv())
      .expiryDate(request.expiryDate())
      .ownerName(request.ownerName())
      .status("PAID")
      .createdAt(Instant.now())
      .build();
    Payment saved = repo.save(p);

    // 2) update order status -> PAID
    try {
      orderClient.updateStatus(orderId, new OrderClient.StatusReq("PAID"));
    } catch (Exception e) {
      // don't fail payment, but mark info in logs
      System.err.println("⚠️ Failed to update order status for orderId=" + orderId + ": " + e.getMessage());
    }

    // 3) async notification (email/sms simulated by your notification-service)
    try {
      NotificationMessage msg = new NotificationMessage(
        List.of("admin@demo.com"), // keep simple for demo (you can replace later)
        "+212000000000",
        "✅ Payment received for Order #" + orderId + " (amount=" + amount + ", method=" + request.method() + ")"
      );

      rabbitTemplate.convertAndSend(
        "notificationExchange",
        "notificationQueue",
        msg
      );
    } catch (Exception e) {
      System.err.println("⚠️ Failed to send payment notification: " + e.getMessage());
    }

    return saved;
  }

  public java.util.List<Payment> all() { return repo.findAll(); }
  public java.util.List<Payment> byOrder(Long orderId) { return repo.findByOrderId(orderId); }

  public record NotificationMessage(java.util.List<String> toList, String phone, String text) {}
}

