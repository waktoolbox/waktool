package com.waktoolbox.waktool.api;

import com.waktoolbox.waktool.api.models.DiscordOAuthResponse;
import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.OAuthResponse;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import com.waktoolbox.waktool.domain.repositories.OAuthRepository;
import com.waktoolbox.waktool.utils.JwtHelper;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class OAuthController {
    private final AccountRepository _accountRepository;
    private final OAuthRepository _oAuthRepository;
    private final JwtHelper _jwtHelper;

    @GetMapping("/oauth/discord/redirect")
    public ResponseEntity<DiscordOAuthResponse> discordOAuth(@RequestParam String code) {
        OAuthResponse oAuthResponse = _oAuthRepository.authByAuthorizationCode(code);
        if (oAuthResponse == null) {
            // TODO error
            return ResponseEntity.internalServerError().build();
        }

        Account oAuthAccount = _oAuthRepository.getAccount(oAuthResponse.accessToken(), oAuthResponse.tokenType());
        if (oAuthAccount == null) {
            // TODO error
            return ResponseEntity.internalServerError().build();
        }

        Account savedAccount = _accountRepository.find(oAuthAccount.getId())
                .map(account -> {
                    account.setEmail(oAuthAccount.getEmail());
                    account.setUsername(oAuthAccount.getUsername());
                    account.setDiscriminator(oAuthAccount.getDiscriminator());
                    return account;
                })
                .or(() -> Optional.of(oAuthAccount))
                .map(_accountRepository::save)
                .orElseThrow(); // TODO manage error

        Claims claims = _jwtHelper.buildClaimsFromValues(
                "discord_id", savedAccount.getId(),
                "username", savedAccount.getUsername(),
                "discriminator", savedAccount.getDiscriminator()
        );

        // We won't keep the sub in the token
        String token = _jwtHelper.generateJwt(claims, null);
        return ResponseEntity.ok(new DiscordOAuthResponse(token));
    }
}
