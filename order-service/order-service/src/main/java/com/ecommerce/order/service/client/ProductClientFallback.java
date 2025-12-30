package com.ecommerce.order.service.client;

import com.ecommerce.order.service.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public Product getProductById(Long id) {
        System.err.println("⚠️ Feign Fallback triggered for product ID " + id);
        return null;
    }

    @Override
    public void reduceStock(Long id, int quantity) {
        System.err.println("[ProductClientFallback] Falling back for reduceStock (Service Unavailable)");
    }
}
