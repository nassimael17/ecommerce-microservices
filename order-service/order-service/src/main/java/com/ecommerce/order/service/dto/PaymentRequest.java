package com.ecommerce.order.service.dto;

public record PaymentRequest(
    Long orderId,
    Double amount,
    String method
) {}
