package com.signal.api.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = "signai-super-secret-key-2026-ai-sign-language";
    private static final long EXPIRY_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public String generateToken(Long userId, String name, String email) {
        return JWT.create()
                .withSubject(email)
                .withClaim("userId", userId)
                .withClaim("name", name)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .sign(Algorithm.HMAC256(SECRET));
    }

    public boolean validateToken(String token) {
        try {
            JWT.require(Algorithm.HMAC256(SECRET)).build().verify(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return JWT.decode(token).getSubject();
    }
}
