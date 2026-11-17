package com.signal.api.controller;

import com.signal.api.dto.LoginRequest;
import com.signal.api.dto.RegisterRequest;
import com.signal.api.entity.User;
import com.signal.api.repository.UserRepository;
import com.signal.api.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    // ── POST /auth/register ──────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is already registered"));
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .build();
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getEmail());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id",     user.getId(),
                        "name",   user.getName(),
                        "email",  user.getEmail(),
                        "mobile", user.getMobile() != null ? user.getMobile() : ""
                )
        ));
    }

    // ── POST /auth/login ─────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        // Find user by either email or mobile number
        return userRepository.findByEmail(req.getEmail())
                .or(() -> userRepository.findByMobile(req.getEmail()))
                .filter(u -> passwordEncoder.matches(req.getPassword(), u.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(u.getId(), u.getName(), u.getEmail());
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "user", Map.of(
                                    "id",     u.getId(),
                                    "name",   u.getName(),
                                    "email",  u.getEmail(),
                                    "mobile", u.getMobile() != null ? u.getMobile() : ""
                            )
                    ));
                })
                .orElseGet(() -> ResponseEntity
                        .status(401)
                        .body(Map.of("error", "Invalid credentials")));
    }

    // ── GET /auth/me (validate token check) ──────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
        String email = jwtUtil.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .or(() -> userRepository.findByMobile(email))
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(), "name", u.getName(), "email", u.getEmail(),
                        "mobile", u.getMobile() != null ? u.getMobile() : "",
                        "createdAt", u.getCreatedAt().toString()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }
}
