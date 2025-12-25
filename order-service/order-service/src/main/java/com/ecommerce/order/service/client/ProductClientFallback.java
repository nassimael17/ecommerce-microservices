package com.ecommerce.order.service.client;

import com.ecommerce.order.service.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public Product getProductById(Long id) {
        System.err.println("⚠️ Fallback triggered for product ID " + id);
        return new Product(
                id,
                "Unknown Product",
                "Fallback - product service unavailable",
                0.0,
                0
        );
    }
}
