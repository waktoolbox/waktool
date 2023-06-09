package com.waktoolbox.waktool.domain.models.drafts;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DraftConfiguration {
    String leader;
    DraftAction[] actions;
    boolean providedByServer;
}
