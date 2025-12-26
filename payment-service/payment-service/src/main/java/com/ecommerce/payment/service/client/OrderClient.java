package com.ecommerce.payment.service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "order-service")
public interface OrderClient {
  @PutMapping("/api/orders/{id}/status")
  Object updateStatus(@PathVariable("id") Long id, @RequestBody StatusReq req);

  record StatusReq(String status) {}
}

