package com.ecommerce.client.service.controller;

import com.ecommerce.client.service.dto.ClientRequest;
import com.ecommerce.client.service.model.Client;
import com.ecommerce.client.service.repository.ClientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

  private final ClientRepository repo;

  public ClientController(ClientRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public List<Client> all() { return repo.findAll(); }

  @GetMapping("/{id}")
  public Client one(@PathVariable Long id) {
    return repo.findById(id).orElseThrow(() -> new RuntimeException("Client not found"));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Client create(@Valid @RequestBody ClientRequest req) {
    if (repo.existsByEmail(req.email())) throw new RuntimeException("Email already exists");
    Client c = Client.builder()
      .fullName(req.fullName())
      .email(req.email())
      .password(req.password()) // In real app, hash this!
      .phone(req.phone())
      .address(req.address())
      .createdAt(Instant.now())
      .build();
    return repo.save(c);
  }

  @PutMapping("/{id}")
  public Client update(@PathVariable Long id, @RequestBody ClientRequest req) {
    Client c = repo.findById(id).orElseThrow(() -> new RuntimeException("Client not found"));
    if (req.fullName() != null && !req.fullName().isBlank()) c.setFullName(req.fullName());
    if (req.email() != null && !req.email().isBlank()) c.setEmail(req.email());
    if (req.phone() != null) c.setPhone(req.phone());
    if (req.address() != null) c.setAddress(req.address());
    return repo.save(c);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) { repo.deleteById(id); }

  @PatchMapping("/{id}/password")
  public void updatePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
    Client c = repo.findById(id).orElseThrow(() -> new RuntimeException("Client not found"));
    String newPassword = body.get("password");
    if (newPassword == null || newPassword.isBlank()) throw new RuntimeException("Password cannot be empty");
    c.setPassword(newPassword);
    repo.save(c);
  }
}

