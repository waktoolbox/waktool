package com.waktoolbox.waktool.domain.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.regex.Pattern;

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
        if (ankamaName == null || ankamaDiscriminator == null) return false;
        Integer parsedDiscriminator = Integer.valueOf(ankamaDiscriminator);
        if (parsedDiscriminator < 1 || parsedDiscriminator > 9999) return false;
        if (!Pattern.matches("^[0-9a-zA-Z-]{3,29}$", ankamaName)) return false;
        return true;
    }
}
