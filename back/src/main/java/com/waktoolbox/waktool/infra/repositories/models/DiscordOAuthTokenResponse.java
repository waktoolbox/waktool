package com.waktoolbox.waktool.infra.repositories.models;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DiscordOAuthTokenResponse(
        String accessToken,
        String expiresIn,
        String refreshToken,
        String scope,
        String tokenType
) {
}
