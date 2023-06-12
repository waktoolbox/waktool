package com.waktoolbox.waktool.domain.models.draft;

import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class DraftUser {
    String id;
    boolean captain;
    boolean present;
    String username;
    String discriminator;

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof DraftUser draftUser) {
            return draftUser.id.equals(this.id);
        }
        return super.equals(obj);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
