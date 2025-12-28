package com.ecommerce.client.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
  @NotBlank String fullName,
  @NotBlank @Email String email,
  @NotBlank String password,
  String phone,
  String address
) {}

