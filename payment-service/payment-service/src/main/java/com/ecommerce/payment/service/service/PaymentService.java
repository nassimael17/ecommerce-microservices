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
    // 1) validate and determine status
    // Simulate failure for specific CVV or invalid amounts
    boolean isSuccessful = amount != null && amount > 0 && !"999".equals(request.cardNumber()); // Using cardNumber since CVV is often 123
    
    // Actually, request has a cvv field, let's use it
    if (request.cvv() != null && "999".equals(request.cvv())) {
        isSuccessful = false;
    }

    String status = isSuccessful ? "PAID" : "FAILED";

    // 1) save payment
    Payment p = Payment.builder()
      .orderId(orderId)
      .amount(amount)
      .method(request.method())
      .cardNumber(request.cardNumber())
      .cvv(request.cvv())
      .expiryDate(request.expiryDate())
      .ownerName(request.ownerName())
      .status(status)
      .createdAt(Instant.now())
      .build();
    Payment saved = repo.save(p);

    // 2) update order status -> Only if PAID
    if (isSuccessful) {
        try {
          orderClient.updateStatus(orderId, new OrderClient.StatusReq("PAID"));
          System.out.println("[PaymentService] Order #" + orderId + " updated to PAID");
        } catch (Exception e) {
          System.err.println("[PaymentService] Failed to update order status for orderId=" + orderId + ": " + e.getMessage());
        }
    } else {
        System.err.println("[PaymentService] Payment FAILED for Order #" + orderId + ". Status remains PENDING.");
    }

    // 3) async notification
    try {
      NotificationMessage msg = new NotificationMessage(
        List.of("admin@demo.com"), 
        "+212000000000",
        "Payment " + status + " for Order #" + orderId + " (MAD " + String.format("%.2f", amount) + " via " + request.method() + ")"
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

  public Payment updateStatus(Long id, String status) {
    Payment p = repo.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
    p.setStatus(status);
    return repo.save(p);
  }

  public record NotificationMessage(java.util.List<String> toList, String phone, String text) {}
}

