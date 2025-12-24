package com.ecommerce.order.service.service;

import com.ecommerce.order.service.client.ProductClient;
import com.ecommerce.order.service.model.Order;
import com.ecommerce.order.service.model.Product;
import com.ecommerce.order.service.model.NotificationMessage;
import com.ecommerce.order.service.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final RabbitTemplate rabbitTemplate;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackCreateOrder")
    public Order createOrder(Long productId, Integer quantity) {
        Product product = productClient.getProductById(productId);
        if (product == null || product.getQuantity() < quantity) {
            throw new RuntimeException("Product not available");
        }

        double totalPrice = product.getPrice() * quantity;

        Order order = Order.builder()
                .productId(productId)
                .quantity(quantity)
                .totalPrice(totalPrice)
                .status("CREATED")
                .build();

        Order savedOrder = orderRepository.save(order);

        // ✅ Send a notification message to RabbitMQ
        rabbitTemplate.convertAndSend(
                "notificationQueue",   // queue name must match Notification Service
                new NotificationMessage(
                        "ajanamehdi751@gmail.com",
                        "+212660553886",
                        "📦 Your order #" + savedOrder.getId() + " has been created successfully!"
                )
        );

        System.out.println("📤 Notification sent for order #" + savedOrder.getId());

        return savedOrder;
    }

    public Order fallbackCreateOrder(Long productId, Integer quantity, Throwable t) {
        return Order.builder()
                .productId(productId)
                .quantity(quantity)
                .totalPrice(0.0)
                .status("FAILED (Fallback triggered)")
                .build();
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
