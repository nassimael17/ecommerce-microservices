package com.ecommerce.payment.service.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  @Bean
  public DirectExchange notificationExchange() {
    return new DirectExchange("notificationExchange");
  }

  @Bean
  public Queue notificationQueue() {
    return new Queue("notificationQueue", true);
  }

  @Bean
  public Binding binding(Queue notificationQueue, DirectExchange notificationExchange) {
    return BindingBuilder.bind(notificationQueue).to(notificationExchange).with("notificationQueue");
  }
}

