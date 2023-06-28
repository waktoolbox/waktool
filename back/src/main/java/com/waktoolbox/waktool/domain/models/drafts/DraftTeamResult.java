package com.waktoolbox.waktool.domain.models.drafts;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class DraftTeamResult {
    Byte[] pickedClasses;
    Byte[] bannedClasses;
}
