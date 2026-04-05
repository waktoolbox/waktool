package com.waktoolbox.waktool.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import javax.crypto.SecretKey;
import java.time.Clock;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class JwtHelper {
    public static final String DISCORD_ID = "discord_id";
    public static final String USERNAME = "username";

    @Value("#{'${jwt.secret}'.getBytes()}")
    private byte[] SECRET;

    private final Clock clock;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET);
    }

    public Claims buildClaimsFromValues(String... values) {
        var claimsBuilder = Jwts.claims();
        for (int i = 0; i < values.length; i += 2) {
            claimsBuilder.add(values[i], values[i + 1]);
        }
        return claimsBuilder.build();
    }

    public String generateJwt(Claims claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(Date.from(clock.instant()))
                .expiration(Date.from(clock.instant().plus(1, ChronoUnit.DAYS)))
                .signWith(getSigningKey())
                .compact();

    }

    public Claims decodeJwt(String token) throws RuntimeException {
        Claims payload = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        if (payload.getExpiration().before(Date.from(clock.instant()))) {
            throw new RuntimeException("Token expired");
        }
        return payload;
    }

    public Optional<Claims> extractFromRequest(HttpServletRequest request) {
        Cookie token = WebUtils.getCookie(request, "token");
        if (token == null) return Optional.empty();

        try {
            Claims claims = decodeJwt(token.getValue());
            return Optional.ofNullable(claims);
        } catch (RuntimeException e) {
            // ignored
        }
        return Optional.empty();
    }
}
