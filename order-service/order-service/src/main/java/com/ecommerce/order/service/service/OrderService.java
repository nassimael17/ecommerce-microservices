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

    public Order createOrder(Long productId, Integer quantity, Long clientId) {
        Product product = productClient.getProductById(productId);
        
        if (product == null) {
            throw new RuntimeException("Product service is currently unavailable. Please try again later.");
        }
        
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getQuantity());
        }

        Client client = clientClient.getClientById(clientId);
        if (client == null) {
            throw new RuntimeException("Client profile not found. Please log in again.");
        }

        double totalPrice = product.getPrice() * quantity;

        Order order = Order.builder()
                .productId(productId)
                .clientId(clientId)
                .quantity(quantity)
                .totalPrice(totalPrice)
                .status("PENDING")
                .build();

        Order savedOrder = orderRepository.save(order);

        // ✅ Process Payment
        try {
            paymentClient.processPayment(new PaymentRequest(savedOrder.getId(), totalPrice, "CREDIT_CARD"));
            savedOrder.setStatus("PAID");
            orderRepository.save(savedOrder);
            
            // 📉 Reduce stock after successful payment
            productClient.reduceStock(productId, quantity);
            System.out.println("[OrderService] Stock reduced for Product ID: " + productId + " Quantity: " + quantity);
            
        } catch (Exception e) {
            System.err.println("⚠️ Payment failed or stock update failed for order #" + savedOrder.getId() + ": " + e.getMessage());
            savedOrder.setStatus("PAYMENT_FAILED");
            orderRepository.save(savedOrder);
            throw new RuntimeException("Order created but payment failed: " + e.getMessage());
        }

        // ✅ Send notification message
        try {
            NotificationMessage notification = new NotificationMessage(
                    List.of(client.getEmail()), 
                    "+212660553886",
                    "Order Success",
                    String.format("Hello %s, your order for %dx %s has been paid successfully! Total: %.2f MAD", 
                        client.getFullName(), quantity, product.getName(), totalPrice)
            );

            rabbitTemplate.convertAndSend("notificationExchange", "notificationQueue", notification);
        } catch (Exception e) {
            System.err.println("⚠️ Notification failed: " + e.getMessage());
        }

        return savedOrder;
    }

    public Order updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        // Send notification about status change
        try {
            Client client = clientClient.getClientById(order.getClientId());
            if (client != null) {
                String statusMessage = getStatusChangeMessage(newStatus, order.getId(), order.getTotalPrice());
                
                NotificationMessage notification = new NotificationMessage(
                        List.of(client.getEmail()),
                        "+212660553886",
                        "Order Status Update",
                        statusMessage
                );

                rabbitTemplate.convertAndSend(
                        "notificationExchange",
                        "notificationQueue",
                        notification
                );

                System.out.println("📤 Sent status update notification for order #" + id + ": " + oldStatus + " → " + newStatus);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send status update notification: " + e.getMessage());
        }

        return updatedOrder;
    }

    private String getStatusChangeMessage(String status, Long orderId, Double totalPrice) {
        return switch (status) {
            case "CONFIRMED" -> String.format("Your order #%d has been confirmed! Total: %.2f MAD. We're preparing it for shipment.", orderId, totalPrice);
            case "SHIPPED" -> String.format("Your order #%d has been shipped! Track your delivery.", orderId);
            case "DELIVERED" -> String.format("Your order #%d has been delivered! Thank you for shopping with us.", orderId);
            case "CANCELED" -> String.format("Your order #%d has been canceled.", orderId);
            default -> String.format("Your order #%d status has been updated to: %s", orderId, status);
        };
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
