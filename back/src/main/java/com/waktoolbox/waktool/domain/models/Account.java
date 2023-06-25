package com.waktoolbox.waktool.domain.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class Account {
    String id;
    String globalName;
    String username;
    String discriminator;
    String email;
    String ankamaName;
    String ankamaDiscriminator;
    String twitchUrl;

    @JsonIgnore
    public String getDisplayName() {
        if (globalName != null) {
            return globalName;
        }

        return username + "#" + discriminator;
    }

    public boolean areAnkamaInfoValid() {
        return ankamaName != null && ankamaDiscriminator != null;
    }
}
