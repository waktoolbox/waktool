package com.waktoolbox.waktool.domain.models.draft;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DraftUser {
    String id;
    boolean captain;
    boolean present;
    String username;
    String discriminator;

    Set<String> drafts = new HashSet<>();

    public DraftUser(String id, String username, String discriminator) {
        this.id = id;
        this.username = username;
        this.discriminator = discriminator;
    }

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

    public void addDraft(String draftId) {
        drafts.add(draftId);
    }

    public void removeDraft(String draftId) {
        drafts.remove(draftId);
    }

    public boolean hasDrafts() {
        return !drafts.isEmpty();
    }
}
