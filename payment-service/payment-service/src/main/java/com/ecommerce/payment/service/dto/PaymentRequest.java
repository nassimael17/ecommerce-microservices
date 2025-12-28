package com.ecommerce.payment.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
  @NotNull Long orderId,
  @NotNull @Min(0) Double amount,
  @NotBlank String method,
  // Optional card details (can be null if CASH)
  String cardNumber,
  String cvv,
  String expiryDate,
  String ownerName
) {}

