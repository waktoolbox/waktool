package com.waktoolbox.waktool.infra.repositories.models;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public record DiscordUserInformationResponse(
        @JsonProperty("id") String id,
        @JsonProperty("username") String username,
        @JsonProperty("global_name") String globalName,
        @JsonProperty("discriminator") String discriminator,
        @JsonProperty("email") String email
) {
}
