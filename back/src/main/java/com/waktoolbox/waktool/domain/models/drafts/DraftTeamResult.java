package com.waktoolbox.waktool.domain.models.drafts;

import com.waktoolbox.waktool.domain.models.Breeds;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@AllArgsConstructor
@Getter
public class DraftTeamResult implements Serializable {
    Breeds[] pickedClasses;
    Breeds[] bannedClasses;
}
