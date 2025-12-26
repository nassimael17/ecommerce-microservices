package com.ecommerce.client.service.repository;

import com.ecommerce.client.service.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
  boolean existsByEmail(String email);
}

