package com.waktoolbox.waktool.domain.models.drafts;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@AllArgsConstructor
@Getter
public class DraftTeamResult implements Serializable {
    Byte[] pickedClasses;
    Byte[] bannedClasses;
}
