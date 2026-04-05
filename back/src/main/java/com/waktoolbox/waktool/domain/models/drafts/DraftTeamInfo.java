package com.waktoolbox.waktool.domain.models.drafts;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@AllArgsConstructor
@Getter
public class DraftTeamInfo implements Serializable {
    String id;
    String name;
}
