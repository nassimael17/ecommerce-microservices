package com.ecommerce.order.service.service;

import com.ecommerce.order.service.client.ProductClient;
import com.ecommerce.order.service.client.ClientClient;
import com.ecommerce.order.service.client.PaymentClient;
import com.ecommerce.order.service.dto.PaymentRequest;
import com.ecommerce.order.service.model.Client;
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
    private final ClientClient clientClient;
    private final PaymentClient paymentClient;
    private final RabbitTemplate rabbitTemplate;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackCreateOrder")
    public Order createOrder(Long productId, Integer quantity, Long clientId) {
        Product product = productClient.getProductById(productId);
        Client client = clientClient.getClientById(clientId);

        if (product == null || product.getQuantity() < quantity) {
            throw new RuntimeException("Product not available");
        }
        if (client == null) {
            throw new RuntimeException("Client not found");
        }

        double totalPrice = product.getPrice() * quantity;

        Order order = Order.builder()
                .productId(productId)
                .clientId(clientId)
                .quantity(quantity)
                .totalPrice(totalPrice)
                .status("CREATED")
                .build();

        Order savedOrder = orderRepository.save(order);

        // ✅ Process Payment
        try {
            paymentClient.processPayment(new PaymentRequest(savedOrder.getId(), totalPrice, "CREDIT_CARD"));
            savedOrder.setStatus("PAID");
            orderRepository.save(savedOrder);
        } catch (Exception e) {
            System.err.println("⚠️ Payment failed for order #" + savedOrder.getId() + ": " + e.getMessage());
            savedOrder.setStatus("PAYMENT_FAILED");
            orderRepository.save(savedOrder);
            // We might still want to notify about failure, but let's stick to success flow for now or separate notification
        }

        // ✅ Send notification message
        try {
            String statusMsg = savedOrder.getStatus().equals("PAID") ? "paid successfully" : "created (Payment Pending/Failed)";
            
            NotificationMessage notification = new NotificationMessage(
                    List.of(client.getEmail()), 
                    "+212660553886",
                    "Order notification",
                    String.format("📦 Hello %s, your order #%d has been %s! Total: %.2f", client.getFullName(), savedOrder.getId(), statusMsg, totalPrice)
            );

            rabbitTemplate.convertAndSend(
                    "notificationExchange",  
                    "notificationQueue",     
                    notification
            );

            System.out.println("📤 Sent notification message for order #" + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send notification for order #" + savedOrder.getId() + ": " + e.getMessage());
        }

        return savedOrder;
    }

    // ✅ Fallback when product-service fails
    public Order fallbackCreateOrder(Long productId, Integer quantity, Long clientId, Throwable t) {
        System.err.println("⚠️ Fallback triggered for product ID " + productId + ": " + t.getMessage());

        Order failedOrder = Order.builder()
                .productId(productId)
                .clientId(clientId)
                .quantity(quantity)
                .totalPrice(0.0)
                .status("FAILED (Fallback triggered)")
                .build();

        Order savedOrder = orderRepository.save(failedOrder);

        try {
            NotificationMessage notification = new NotificationMessage(
                    List.of("ajanamehdi751@gmail.com"),
                    "+212660553886",
                    "Order notification",
                    "⚠️ Order #" + savedOrder.getId() + " failed to process (Fallback triggered)."
            );

            rabbitTemplate.convertAndSend(
                    "notificationExchange",
                    "notificationQueue",
                    notification
            );
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send fallback notification: " + e.getMessage());
        }

        return savedOrder;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
