package com.ecommerce.order.service.client;

import com.ecommerce.order.service.model.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "product-service",
        fallback = ProductClientFallback.class
)
public interface ProductClient {

    @GetMapping("/{id}")
    Product getProductById(@PathVariable("id") Long id);
}
