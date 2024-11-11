package com.waktoolbox.waktool.infra.repositories;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.OAuthResponse;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import com.waktoolbox.waktool.domain.repositories.DiscordRepository;
import com.waktoolbox.waktool.domain.repositories.NotificationRepository;
import com.waktoolbox.waktool.domain.repositories.OAuthRepository;
import com.waktoolbox.waktool.infra.repositories.models.*;
import com.waktoolbox.waktool.utils.Translator;
import com.waktoolbox.waktool.utils.TranslatorKey;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscordRepositoryImpl implements DiscordRepository, NotificationRepository, OAuthRepository {
    private static final RestTemplate DEFAULT_REST_TEMPLATE = new RestTemplate();
    private static final String BOT_TOKEN_AUTHORIZATION = "Bot %s";

    private final AccountRepository _accountRepository;
    private final Translator _translator;

    @Value("${oauth2.discord.token-uri}")
    private String _tokenUri;

    @Value("${oauth2.discord.user-info-uri}")
    private String _userInfoUri;

    @Value("${oauth2.discord.base-url}")
    private String _baseUrl;

    @Value("${oauth2.discord.client-id}")
    private String _clientId;

    @Value("${oauth2.discord.client-secret}")
    private String _clientSecret;

    @Value("${oauth2.discord.token}")
    private String _botToken;

    @Value("${oauth2.discord.authorization-grant-type}")
    private String _authorizationGrantType;

    @Value("${oauth2.discord.scope}")
    private List<String> _scope;

    @Value("${oauth2.discord.redirect-uri}")
    private String _redirectUri;

    private RestTemplate _camelCaseMappingRestTemplate;

    @PostConstruct
    public void setupMapperAndTemplates() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

        _camelCaseMappingRestTemplate = new RestTemplateBuilder()
                .additionalMessageConverters(new MappingJackson2HttpMessageConverter(mapper))
                .build();
    }

    public OAuthResponse authByAuthorizationCode(String code) {

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        httpHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));
        String credentials = Base64.getEncoder().encodeToString(String.format("%s:%s", _clientId, _clientSecret).getBytes());
        httpHeaders.add("Authorization", "Basic " + credentials);

        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("client_id", _clientId);
        requestBody.add("client_secret", _clientSecret);
        requestBody.add("redirect_uri", _redirectUri);
        requestBody.add("scope", String.join(",", _scope));
        requestBody.add("code", code);
        requestBody.add("grant_type", _authorizationGrantType);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, httpHeaders);
        try {
            // Sorry, I hate url form encoded crap
            // I tried some better way to do this, but after 3 hours, crappy code is working, nice code isn't
            DiscordOAuthTokenResponse body = DEFAULT_REST_TEMPLATE.exchange(_tokenUri, HttpMethod.POST, request, DiscordOAuthTokenResponse.class).getBody();
            if (body == null) throw new IllegalStateException("Null body while request is success, should not happen");
            return new OAuthResponse(body.accessToken(), body.tokenType());
        } catch (Exception e) {
            log.error("Unable to process OAuth request", e);
            return null;
        }
    }

    @Override
    public Account getAccount(String token, String tokenType) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set("Authorization", String.format("%s %s", tokenType, token));

        try {
            DiscordUserInformationResponse userInformation = _camelCaseMappingRestTemplate.exchange(_userInfoUri, HttpMethod.GET, new HttpEntity<>(httpHeaders), DiscordUserInformationResponse.class).getBody();
            if (userInformation == null) throw new IllegalStateException("User is null, should not happen");
            return Account.builder()
                    .id(userInformation.id())
                    .email(userInformation.email())
                    .username(userInformation.username())
                    .globalName(userInformation.globalName())
                    .discriminator(userInformation.discriminator())
                    .build();
        } catch (Exception e) {
            log.error("Unable to process GET on user information", e);
            return null;
        }
    }

    private record GuildMember(String joinedAt) {
    }

    @Override
    public boolean isGuildMember(String guildId, String userId) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set("Authorization", String.format(BOT_TOKEN_AUTHORIZATION, _botToken));

        try {
            ResponseEntity<GuildMember> entity = _camelCaseMappingRestTemplate.exchange(
                    _baseUrl + "/guilds/" + guildId + "/members/" + userId,
                    HttpMethod.GET,
                    new HttpEntity<>(httpHeaders),
                    GuildMember.class
            );
            return entity.getStatusCode() == HttpStatus.OK;
        } catch (HttpClientErrorException.NotFound e) {
            return false; // normal 404
        } catch (Exception e) {
            log.error("Unable to fetch guild member " + userId + " of guild " + guildId, e);
            return false;
        }
    }

    @Override
    public void notifyUser(String userId, TranslatorKey key, Object... args) {
        notifyUser(userId, key.getKey(), args);
    }

    @Override
    public void notifyUser(String userId, String key, Object... args) {
        _accountRepository.find(userId).ifPresent(account -> {
            Locale locale = Optional.ofNullable(account.getLocale()).map(Locale::forLanguageTag).orElse(Locale.ENGLISH);
            String message = _translator.get(key, locale, args);

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.set("Authorization", String.format(BOT_TOKEN_AUTHORIZATION, _botToken));

            try {
                DiscordDMChannel channel = _camelCaseMappingRestTemplate.exchange(
                        _baseUrl + "/users/@me/channels",
                        HttpMethod.POST,
                        new HttpEntity<>(new DiscordCreateDM(userId), httpHeaders),
                        DiscordDMChannel.class
                ).getBody();

                if (channel == null) {
                    log.error("Can't find channel for user {}", userId);
                    return;
                }

                notifyChannel(channel.id(), DiscordMessage.builder().content(message).build());
            } catch (Exception e) {
                log.error("Unable to send message to user {}", userId, e);
            }
        });
    }

    public void notifyChannel(String channelId, DiscordMessage message) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set("Authorization", String.format(BOT_TOKEN_AUTHORIZATION, _botToken));

        _camelCaseMappingRestTemplate.exchange(
                _baseUrl + "/channels/" + channelId + "/messages",
                HttpMethod.POST,
                new HttpEntity<>(message, httpHeaders),
                Void.class
        );
    }
}
