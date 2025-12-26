package com.ecommerce.payment.service.controller;

import com.ecommerce.payment.service.dto.PaymentRequest;
import com.ecommerce.payment.service.model.Payment;
import com.ecommerce.payment.service.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

  private final PaymentService service;

  public PaymentController(PaymentService service) {
    this.service = service;
  }

  @GetMapping
  public List<Payment> all() { return service.all(); }

  @GetMapping("/by-order/{orderId}")
  public List<Payment> byOrder(@PathVariable Long orderId) { return service.byOrder(orderId); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Payment pay(@Valid @RequestBody PaymentRequest req) {
    return service.pay(req.orderId(), req.amount(), req.method());
  }
}

