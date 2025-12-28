package com.ecommerce.order.service.service;

import com.ecommerce.order.service.client.ProductClient;
import com.ecommerce.order.service.model.NotificationMessage;
import com.ecommerce.order.service.model.Order;
import com.ecommerce.order.service.model.Product;
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

        // ✅ Send notification message
        try {
            NotificationMessage notification = new NotificationMessage(
                    List.of("ajanamehdi751@gmail.com"),
                    "+212660553886",
                    "📦 Your order #" + savedOrder.getId() + " has been created successfully!"
            );

            rabbitTemplate.convertAndSend(
                    "notificationExchange",  // Exchange
                    "notificationQueue",     // Routing key
                    notification
            );

            System.out.println("📤 Sent notification message for order #" + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send notification for order #" + savedOrder.getId() + ": " + e.getMessage());
        }

        return savedOrder;
    }

    // ✅ Fallback when product-service fails
    public Order fallbackCreateOrder(Long productId, Integer quantity, Throwable t) {
        System.err.println("⚠️ Fallback triggered for product ID " + productId + ": " + t.getMessage());

        Order failedOrder = Order.builder()
                .productId(productId)
                .quantity(quantity)
                .totalPrice(0.0)
                .status("FAILED (Fallback triggered)")
                .build();

        Order savedOrder = orderRepository.save(failedOrder);

        try {
            NotificationMessage notification = new NotificationMessage(
                    List.of("ajanamehdi751@gmail.com"),
                    "+212660553886",
                    "⚠️ Order #" + savedOrder.getId() + " failed to process (Fallback triggered)."
            );

            rabbitTemplate.convertAndSend(
                    "notificationExchange",
                    "notificationQueue",
                    notification
            );

            System.out.println("📤 Sent fallback notification for order #" + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send fallback notification: " + e.getMessage());
        }

        return savedOrder;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
