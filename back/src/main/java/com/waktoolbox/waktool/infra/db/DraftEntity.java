package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.drafts.DraftAction;
import com.waktoolbox.waktool.domain.models.drafts.DraftConfiguration;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeamInfo;
import com.waktoolbox.waktool.domain.models.drafts.DraftUser;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "drafts_data")
public class DraftEntity {
    @Id
    String id;

    @Type(JsonBinaryType.class)
    @Column
    DraftData content;

    @Getter
    @Setter
    public static class DraftData {
        List<DraftUser> teamA;
        List<DraftUser> teamB;
        List<DraftAction> history;
        DraftTeamInfo teamAInfo;
        DraftTeamInfo teamBInfo;
        DraftConfiguration configuration;
        int currentAction;
    }
}
