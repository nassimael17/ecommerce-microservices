package com.ecommerce.product.service.config;

import com.ecommerce.product.service.model.Product;
import com.ecommerce.product.service.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("[DataLoader] Initializing product database...");
                repository.saveAll(List.of(
                    Product.builder()
                        .name("Laptop Pro")
                        .description("Precision-crafted aluminum body, high-resolution Retina display, and industry-leading performance.")
                        .price(15000.0)
                        .quantity(10)
                        .imageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800")
                        .available(true)
                        .build(),
                    Product.builder()
                        .name("Smartphone X")
                        .description("Experience the ultimate mobile technology with an edge-to-edge OLED display and pro-grade camera system.")
                        .price(8000.0)
                        .quantity(20)
                        .imageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800")
                        .available(true)
                        .build(),
                    Product.builder()
                        .name("Wireless Earbuds")
                        .description("Active Noise Cancelling, transparency mode, and spatial audio for an immersive listening experience.")
                        .price(1200.0)
                        .quantity(50)
                        .imageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800")
                        .available(true)
                        .build(),
                    Product.builder()
                        .name("Gaming Mouse")
                        .description("Ultra-lightweight gaming mouse with precision sensor and customizable RGB lighting.")
                        .price(500.0)
                        .quantity(100)
                        .imageUrl("https://images.unsplash.com/photo-1527814050087-379371152a93?auto=format&fit=crop&q=80&w=800")
                        .available(true)
                        .build()
                ));
                System.out.println("[DataLoader] Product database initialized with images.");
            }
        };
    }
}
