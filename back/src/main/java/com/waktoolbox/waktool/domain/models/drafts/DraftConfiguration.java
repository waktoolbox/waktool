package com.waktoolbox.waktool.domain.models.drafts;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class DraftConfiguration implements Serializable {
    String leader;
    DraftAction[] actions;
    boolean providedByServer;
}
