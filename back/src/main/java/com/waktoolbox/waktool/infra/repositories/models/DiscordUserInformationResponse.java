package com.waktoolbox.waktool.infra.repositories.models;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public record DiscordUserInformationResponse(
        String id,
        String username,

        String globalName,
        String discriminator,
        String email
) {
}
