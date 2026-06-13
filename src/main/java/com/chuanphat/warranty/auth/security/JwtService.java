package com.chuanphat.warranty.auth.security;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final ObjectMapper objectMapper;
    private final String secret;
    private final long accessTokenSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            Environment environment,
            @Value("${app.security.jwt.secret:}") String secret,
            @Value("${app.security.jwt.access-token-seconds:900}") long accessTokenSeconds
    ) {
        this.objectMapper = objectMapper;
        this.secret = secret;
        this.accessTokenSeconds = accessTokenSeconds;
        validateProductionSecret(environment);
    }

    public String generateAccessToken(AppUser user) {
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getUsername());
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().getCode());
        claims.put("roles", user.getRoles().stream().map(role -> role.getCode()).toList());
        claims.put("branchId", user.getBranchId());
        claims.put("branchIds", user.getBranchAccesses().stream().map(access -> access.getBranchId()).toList());
        claims.put("iat", Instant.now().getEpochSecond());
        claims.put("exp", Instant.now().plusSeconds(accessTokenSeconds).getEpochSecond());
        return sign(claims);
    }

    public String subject(String token) {
        return claims(token).get("sub").toString();
    }

    public boolean isValid(String token) {
        try {
            claims(token);
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private Map<String, Object> claims(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid token");
        }
        String expected = hmac(parts[0] + "." + parts[1]);
        if (!constantTimeEquals(expected, parts[2])) {
            throw new IllegalArgumentException("Invalid token signature");
        }
        try {
            Map<String, Object> claims = objectMapper.readValue(base64UrlDecode(parts[1]), new TypeReference<Map<String, Object>>() {});
            Number exp = (Number) claims.get("exp");
            if (exp == null || Instant.now().getEpochSecond() > exp.longValue()) {
                throw new IllegalArgumentException("Token expired");
            }
            return claims;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid token payload", exception);
        }
    }

    private String sign(Map<String, Object> claims) {
        try {
            String header = base64UrlEncode(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String payload = base64UrlEncode(objectMapper.writeValueAsBytes(claims));
            String signingInput = header + "." + payload;
            return signingInput + "." + hmac(signingInput);
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot create JWT", exception);
        }
    }

    private String hmac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return base64UrlEncode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot sign JWT", exception);
        }
    }

    private static String base64UrlEncode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private static byte[] base64UrlDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    private static boolean constantTimeEquals(String left, String right) {
        return MessageDigest.isEqual(left.getBytes(StandardCharsets.UTF_8), right.getBytes(StandardCharsets.UTF_8));
    }

    private void validateProductionSecret(Environment environment) {
        boolean production = Arrays.stream(environment.getActiveProfiles()).anyMatch("prod"::equals);
        if (!production) {
            return;
        }
        if (secret == null || secret.isBlank() || secret.startsWith("change-this") || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be set to a strong production secret");
        }
    }
}
