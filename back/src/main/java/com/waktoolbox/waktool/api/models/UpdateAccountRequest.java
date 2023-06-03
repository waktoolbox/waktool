package com.waktoolbox.waktool.api.models;

public record UpdateAccountRequest(String ankamaName,
                                   String ankamaDiscriminator,
                                   String twitchUrl
) {
}
