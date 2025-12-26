package com.ecommerce.notification.service.store;

import com.ecommerce.notification.service.model.NotificationMessage;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class NotificationStore {

  public static class Item {
    public String subject;
    public String message;
    public List<String> to;
    public String phone;
    public String createdAt;

    public Item() {}

    public Item(String subject, String message, List<String> to, String phone) {
      this.subject = subject;
      this.message = message;
      this.to = to;
      this.phone = phone;
      this.createdAt = Instant.now().toString();
    }
  }

  private final List<Item> items = Collections.synchronizedList(new ArrayList<>());

  public void add(Item i) {
    items.add(0, i); // newest first
    if (items.size() > 200) items.remove(items.size() - 1);
  }

  public List<Item> all() {
    return new ArrayList<>(items);
  }
}
