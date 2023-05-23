package com.waktoolbox.waktool.infra.repositories;

import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.OAuthResponse;
import com.waktoolbox.waktool.domain.repositories.OAuthRepository;
import com.waktoolbox.waktool.infra.repositories.models.DiscordOAuthTokenResponse;
import com.waktoolbox.waktool.infra.repositories.models.DiscordUserInformationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscordOAuthRepository implements OAuthRepository {
    @Value("${oauth2.discord.token-uri}")
    private String _tokenUri;

    @Value("${oauth2.discord.user-info-uri}")
    private String _userInfoUri;

    @Value("${oauth2.discord.client-id}")
    private String _clientId;

    @Value("${oauth2.discord.client-secret}")
    private String _clientSecret;

    @Value("${oauth2.discord.authorization-grant-type}")
    private String _authorizationGrantType;

    @Value("${oauth2.discord.scope}")
    private List<String> _scope;

    @Value("${oauth2.discord.redirect-uri}")
    private String _redirectUri;

    private final RestTemplate _restTemplate;

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
            DiscordOAuthTokenResponse body = new RestTemplate().exchange(_tokenUri, HttpMethod.POST, request, DiscordOAuthTokenResponse.class).getBody();
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
            DiscordUserInformationResponse userInformation = _restTemplate.exchange(_userInfoUri, HttpMethod.GET, new HttpEntity<>(httpHeaders), DiscordUserInformationResponse.class).getBody();
            if (userInformation == null) throw new IllegalStateException("User is null, should not happen");
            return Account.builder()
                    .id(userInformation.id())
                    .email(userInformation.email())
                    .username(userInformation.username())
                    .discriminator(userInformation.discriminator())
                    .build();
        } catch (Exception e) {
            log.error("Unable to process GET on user information", e);
            return null;
        }
    }
}
