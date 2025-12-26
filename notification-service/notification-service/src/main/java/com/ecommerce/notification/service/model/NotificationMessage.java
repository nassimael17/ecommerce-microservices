package com.ecommerce.notification.service.model;

import java.util.List;

public class NotificationMessage {
  private List<String> to;
  private String phone;
  private String message;

  public NotificationMessage() {}

  public NotificationMessage(List<String> to, String phone, String message) {
    this.to = to;
    this.phone = phone;
    this.message = message;
  }

  public List<String> getTo() { return to; }
  public void setTo(List<String> to) { this.to = to; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}
