package com.ecommerce.client.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
  @NotBlank String fullName,
  @Email String email,
  String password,
  String phone,
  String address
) {}

