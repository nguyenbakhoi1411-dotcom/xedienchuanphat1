import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.Map;

public class GenerateToken {
    public static void main(String[] args) {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable is required");
        }
        var key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        
        long exp = System.currentTimeMillis() + 3600000; // 1 hr

        String adminToken = Jwts.builder()
                .setSubject("admin")
                .addClaims(Map.of("roles", "ADMIN"))
                .setExpiration(new Date(exp))
                .signWith(key)
                .compact();

        String salesToken = Jwts.builder()
                .setSubject("sales")
                .addClaims(Map.of("roles", "SALES"))
                .setExpiration(new Date(exp))
                .signWith(key)
                .compact();
        
        System.out.println("ADMIN_TOKEN=" + adminToken);
        System.out.println("SALES_TOKEN=" + salesToken);
    }
}
