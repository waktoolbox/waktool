package com.waktoolbox.waktool.api;

import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.OAuthResponse;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import com.waktoolbox.waktool.domain.repositories.OAuthRepository;
import com.waktoolbox.waktool.utils.JwtHelper;
import com.waktoolbox.waktool.utils.SpringLocaleResolver;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerErrorException;

import java.net.URI;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class OAuthController {
    @Value("${waktool.base-url}")
    private String _baseUrl;

    private final AccountRepository _accountRepository;
    private final OAuthRepository _oAuthRepository;
    private final JwtHelper _jwtHelper;
    private final SpringLocaleResolver _localeResolver;

    @GetMapping("/oauth/discord/redirect")
    public ResponseEntity<Void> discordOAuth(HttpServletRequest request, @RequestParam String code) {
        OAuthResponse oAuthResponse = _oAuthRepository.authByAuthorizationCode(code);
        if (oAuthResponse == null) {
            throw new ServerErrorException("Couldn't get an OAuth response from Discord", new Exception());
        }

        String locale = _localeResolver.resolve(request);

        Account oAuthAccount = _oAuthRepository.getAccount(oAuthResponse.accessToken(), oAuthResponse.tokenType());
        if (oAuthAccount == null) {
            throw new ServerErrorException("Couldn't get an account from Discord", new Exception());
        } else {
            oAuthAccount.setLocale(locale);
        }

        Account savedAccount = _accountRepository.find(oAuthAccount.getId())
                .map(account -> {
                    account.setEmail(oAuthAccount.getEmail());
                    account.setUsername(oAuthAccount.getUsername());
                    account.setDiscriminator(oAuthAccount.getDiscriminator());
                    account.setGlobalName(oAuthAccount.getGlobalName());
                    account.setLocale(locale);
                    return account;
                })
                .or(() -> Optional.of(oAuthAccount))
                .map(_accountRepository::save)
                .orElseThrow(() -> new ServerErrorException("Couldn't save the account", new Exception()));

        Claims claims = _jwtHelper.buildClaimsFromValues(
                JwtHelper.DISCORD_ID, savedAccount.getId(),
                JwtHelper.USERNAME, savedAccount.getDisplayName()
        );

        // We won't keep the sub in the token
        String token = _jwtHelper.generateJwt(claims, null);

        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge((long) 60 * 60 * 24) // 1 day
                .build();

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .location(URI.create(_baseUrl + (savedAccount.areAnkamaInfoValid() ? "" : "/account")))
                .build();
    }

    @GetMapping("/oauth/disconnect")
    public ResponseEntity<Void> disconnect() {
        ResponseCookie cookie = ResponseCookie.from("token", null)
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .location(URI.create(_baseUrl))
                .build();
    }
}
