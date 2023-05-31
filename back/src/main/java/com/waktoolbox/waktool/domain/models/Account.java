package com.waktoolbox.waktool.domain.models;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class Account {
    String id;
    String username;
    String discriminator;
    String email;
    String ankamaName;
    String ankamaDiscriminator;
    String twitchUrl;

    public boolean areAnkamaInfoValid() {
        return ankamaName != null && ankamaDiscriminator != null;
    }
}
