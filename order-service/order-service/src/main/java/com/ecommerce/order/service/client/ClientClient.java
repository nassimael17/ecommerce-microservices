package com.ecommerce.order.service.client;

import com.ecommerce.order.service.model.Client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "client-service") 
public interface ClientClient {
    @GetMapping("/api/clients/{id}")
    Client getClientById(@PathVariable("id") Long id);
}
