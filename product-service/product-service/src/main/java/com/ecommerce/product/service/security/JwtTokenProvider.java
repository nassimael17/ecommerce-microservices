package com.ecommerce.product.service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;

@Component
public class JwtTokenProvider {
    // Must match the key used in Client/Auth service for token generation
    // Using the same key found in other services or a consistent default
    private static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(io.jsonwebtoken.io.Decoders.BASE64.decode(SECRET));
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody();
        return claims.getSubject();
    }
}
