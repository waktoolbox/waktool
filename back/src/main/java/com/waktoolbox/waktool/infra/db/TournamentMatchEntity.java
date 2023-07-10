package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "matches")
public class TournamentMatchEntity {
    @Id
    String id;

    @Column
    String tournamentId;

    @Column
    int phase;

    @Type(JsonBinaryType.class)
    @Column
    TournamentMatch content;
}
