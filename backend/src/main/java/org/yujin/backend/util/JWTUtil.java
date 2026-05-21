package org.yujin.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

@Log4j2
public class JWTUtil {

    private static final String KEY =
            "1234567890123456789012345678901234567890";

    public static String generateToken(
            Map<String, Object> valueMap,
            int minutes
    ) {

        SecretKey key =
                Keys.hmacShaKeyFor(
                        KEY.getBytes(StandardCharsets.UTF_8)
                );

        return Jwts.builder()
                .setHeader(
                        Map.of("typ", "JWT")
                )
                .setClaims(valueMap)
                .setIssuedAt(
                        Date.from(
                                ZonedDateTime.now()
                                        .toInstant()
                        )
                )
                .setExpiration(
                        Date.from(
                                ZonedDateTime.now()
                                        .plusMinutes(minutes)
                                        .toInstant()
                        )
                )
                .signWith(key)
                .compact();
    }

    public static Map<String, Object> validateToken(
            String token
    ) {

        try {

            SecretKey key =
                    Keys.hmacShaKeyFor(
                            KEY.getBytes(StandardCharsets.UTF_8)
                    );

            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        } catch (MalformedJwtException e) {

            throw new CustomJWTException("Malformed");

        } catch (ExpiredJwtException e) {

            throw new CustomJWTException("Expired");

        } catch (InvalidClaimException e) {

            throw new CustomJWTException("Invalid");

        } catch (JwtException e) {

            throw new CustomJWTException("JWTError");

        } catch (Exception e) {

            throw new CustomJWTException("Error");
        }
    }
}