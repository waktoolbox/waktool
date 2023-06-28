package com.waktoolbox.waktool.domain.models.drafts;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    String displayName;

    @JsonIgnore
    Set<String> drafts = new HashSet<>();

    public DraftUser(String id, String displayName) {
        this.id = id;
        this.displayName = displayName;
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
