package com.waktoolbox.waktool.api.models;

public record AccountResponse(String id,
                              String username,
                              String discriminator,
                              String ankamaName,
                              String ankamaDiscriminator,
                              String twitchUrl
) {
}
