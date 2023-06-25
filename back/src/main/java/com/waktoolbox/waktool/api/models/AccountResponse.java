package com.waktoolbox.waktool.api.models;

public record AccountResponse(String id,
                              String displayName,
                              String ankamaName,
                              String ankamaDiscriminator,
                              String twitchUrl
) {
}
