package com.ExamPort.ExamPort.Security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    /** HS256 requires a key of at least 256 bits; use a UTF-8 string of 32+ characters. */
    @Value("${JWT_SECRET:}")
    private String jwtSecretFromEnv;

    private Key key;

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 5; // 5 hours

    @PostConstruct
    void initSigningKey() {
        String secret = jwtSecretFromEnv != null ? jwtSecretFromEnv.trim() : "";
        if (!secret.isEmpty()) {
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) {
                throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 bytes in UTF-8 for HS256 (current: " + bytes.length + ")");
            }
            this.key = Keys.hmacShaKeyFor(bytes);
            logger.info("JWT signing key loaded from JWT_SECRET");
        } else {
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            logger.warn(
                "JWT_SECRET is not set; using an ephemeral HS256 key (tokens invalid after restart). "
                    + "Set JWT_SECRET to a stable value (>= 32 UTF-8 characters).");
        }
    }

    public Key getKey() {
        return key;
    }

    public String generateToken(String username, String role) {
        logger.debug("Generating JWT token for user: {} with role: {}", username, role);
        
        try {
            Map<String, Object> claims = new HashMap<>();
            // Ensure the role is prefixed with 'ROLE_'
            String springRole = role.startsWith("ROLE_") ? role : ("ROLE_" + role.toUpperCase());
            claims.put("roles", java.util.Arrays.asList(springRole));
            
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                    .signWith(key)
                    .compact();
            
            logger.info("JWT token generated successfully for user: {}", username);
            return token;
        } catch (Exception e) {
            logger.error("Error generating JWT token for user: {}", username, e);
            throw e;
        }
    }

    public String extractUsername(String token) {
        try {
            String username = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
            logger.debug("Extracted username from token: {}", username);
            return username;
        } catch (Exception e) {
            logger.warn("Error extracting username from JWT token: {}", e.getMessage());
            throw e;
        }
    }

    public String extractRole(String token) {
        try {
            String role = (String) Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().get("role");
            logger.debug("Extracted role from token: {}", role);
            return role;
        } catch (Exception e) {
            logger.warn("Error extracting role from JWT token: {}", e.getMessage());
            throw e;
        }
    }
}
