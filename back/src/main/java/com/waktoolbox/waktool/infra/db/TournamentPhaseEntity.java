package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.TournamentPhaseData;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.io.Serializable;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tournaments_data")
public class TournamentPhaseEntity {
    @EmbeddedId
    TournamentPhaseId id;

    @Type(JsonBinaryType.class)
    @Column
    TournamentPhaseData content;

    @NoArgsConstructor
    @Embeddable
    @EqualsAndHashCode
    @Getter
    @Setter
    public static class TournamentPhaseId implements Serializable {
        String tournamentId;
        int phase;
    }
}
