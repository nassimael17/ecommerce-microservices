package com.ecommerce.notification.service.listener;

import com.ecommerce.notification.service.config.RabbitMQConfig;
import com.ecommerce.notification.service.model.NotificationMessage;
import com.ecommerce.notification.service.store.NotificationStore;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

  private final NotificationStore store;

  public NotificationListener(NotificationStore store) {
    this.store = store;
  }

  @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME, containerFactory = "rabbitListenerContainerFactory")
  public void onMessage(NotificationMessage msg) {
    String subject = "Notification";
    String text = msg != null ? msg.getMessage() : "(empty)";
    System.out.println("📥 Notification received: " + text);

    store.add(new NotificationStore.Item(subject, text,
      msg != null ? msg.getTo() : null,
      msg != null ? msg.getPhone() : null
    ));
  }
}
