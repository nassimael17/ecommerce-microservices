package com.ecommerce.order.service.client;

import com.ecommerce.order.service.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public Product getProductById(Long id) {
        System.err.println("⚠️ Fallback triggered for product ID " + id);
        // Return a placeholder product when the call to product-service fails
        Product fallbackProduct = new Product();
        fallbackProduct.setId(id);
        fallbackProduct.setName("Unavailable Product");
        fallbackProduct.setPrice(0.0);
        fallbackProduct.setQuantity(0);
        return fallbackProduct;
    }
}
