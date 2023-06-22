package com.waktoolbox.waktool.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtHelper {
    public static final String DISCORD_ID = "discord_id";
    public static final String USERNAME = "username";
    public static final String DISCRIMINATOR = "discriminator";

    @Value("#{'${jwt.secret}'.getBytes()}")
    private byte[] SECRET;

    public Claims buildClaimsFromValues(String... values) {
        Claims claims = Jwts.claims();
        for (int i = 0; i < values.length; i += 2) {
            claims.put(values[i], values[i + 1]);
        }
        return claims;
    }

    public String generateJwt(Claims claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(1, ChronoUnit.DAYS)))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();

    }

    public Claims decodeJwt(String token) throws RuntimeException {
        Claims body = Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody();
        if (body.getExpiration().before(Date.from(Instant.now()))) {
            throw new RuntimeException("Token expired");
        }
        return body;
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
