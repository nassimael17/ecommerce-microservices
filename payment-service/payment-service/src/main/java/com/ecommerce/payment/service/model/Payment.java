package com.ecommerce.payment.service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long orderId;

  @Column(nullable = false)
  private Double amount;

  @Column(nullable = false)
  private String method; // CARD/CASH...

  // New fields for CARD payment
  private String cardNumber;
  private String cvv;
  private String expiryDate;
  private String ownerName;

  @Column(nullable = false)
  private String status; // PAID/FAILED

  @Column(nullable = false)
  private Instant createdAt;
}

