package com.waktoolbox.waktool.api;

import com.waktoolbox.waktool.api.mappers.AccountMapper;
import com.waktoolbox.waktool.api.models.*;
import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class AccountController {
    private final AccountRepository _accountRepository;
    private final AccountMapper _accountMapper;

    @GetMapping("/accounts")
    public ResponseEntity<AccountResponse> getAccount(@RequestAttribute Optional<String> discordId) {
        Account account = _accountRepository
                .find(discordId.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized")))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        return ResponseEntity.ok(_accountMapper.to(account));
    }

    @PostMapping("/accounts:search")
    public ResponseEntity<AccountSearchResponse> searchAccounts(@RequestBody AccountSearchRequest request) {
        List<LightAccountResponse> accounts = _accountRepository.find(request.ids()).stream().map(a -> new LightAccountResponse(a.getId(), a.getDisplayName())).toList();
        return ResponseEntity.ok(new AccountSearchResponse(accounts));
    }

    @PostMapping("/streamers:search")
    public ResponseEntity<StreamerSearchResponse> searchStreamers(@RequestBody AccountSearchRequest request) {
        return ResponseEntity.ok(new StreamerSearchResponse(_accountRepository.findStreamers(request.ids())));
    }

    @PostMapping("/accounts/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@RequestAttribute Optional<String> discordId, @PathVariable String id, @RequestBody UpdateAccountRequest request) {
        if (discordId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        if (!discordId.get().equals(id)) {
            // TODO add admin rights check here
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        if (request.ankamaName() == null || request.ankamaName().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ankama name is required");
        }

        if (!Pattern.matches("^[0-9a-zA-Z-]{3,29}$", request.ankamaName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ankama name is invalid");
        }

        if (request.ankamaDiscriminator() == null || request.ankamaDiscriminator().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ankama discriminator is required");
        }

        try {
            int discriminator = Integer.parseInt(request.ankamaDiscriminator());
            if (discriminator < 1 || discriminator > 9999) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discriminator isn't valid");
            }
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discriminator isn't valid");
        }

        String twitchUrl = request.twitchUrl() != null && !request.twitchUrl().isEmpty() ? request.twitchUrl() : null;
        if (twitchUrl != null && !Pattern.matches("^(https://)((www|en-es|en-gb|secure|beta|ro|www-origin|en-ca|fr-ca|lt|zh-tw|he|id|ca|mk|lv|ma|tl|hi|ar|bg|vi|th)\\.)?twitch\\.tv/(?!directory|p|user/legal|admin|login|signup|jobs)([\\w+]{4,25})$", twitchUrl)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Twitch URL isn't valid");
        }

        Account account = _accountRepository.find(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        account.setAnkamaName(request.ankamaName());
        account.setAnkamaDiscriminator(request.ankamaDiscriminator());
        account.setTwitchUrl(request.twitchUrl());
        return ResponseEntity.ok(_accountMapper.to(_accountRepository.save(account)));
    }
}
