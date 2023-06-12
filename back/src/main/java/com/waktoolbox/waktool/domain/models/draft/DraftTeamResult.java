package com.waktoolbox.waktool.domain.models.draft;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class DraftTeamResult {
    Byte[] pickedClasses;
    Byte[] bannedClasses;
}
