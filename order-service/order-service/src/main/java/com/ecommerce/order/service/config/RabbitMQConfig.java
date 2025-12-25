package com.ecommerce.notification.service.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATION_QUEUE = "notificationQueue";

    @Bean
    public Queue notificationQueue() {
        // durable = true means the queue will persist after restarts
        return new Queue(NOTIFICATION_QUEUE, true);
    }
}
