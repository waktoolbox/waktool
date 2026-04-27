package com.waktoolbox.waktool.infra.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "match_reports")
@IdClass(MatchReportEntity.MatchReportId.class)
public class MatchReportEntity {

    @Id
    @Column(name = "match_id")
    String matchId;

    @Id
    @Column(name = "round")
    int round;

    @Column(name = "tournament_id")
    String tournamentId;

    @Column(name = "team_a_reported_winner")
    String teamAReportedWinner;

    @Column(name = "team_a_reporter_id")
    String teamAReporterId;

    @Column(name = "team_a_screenshot", columnDefinition = "TEXT")
    String teamAScreenshot;

    @Column(name = "team_a_dispute_explanation", columnDefinition = "TEXT")
    String teamADisputeExplanation;

    @Column(name = "team_b_reported_winner")
    String teamBReportedWinner;

    @Column(name = "team_b_reporter_id")
    String teamBReporterId;

    @Column(name = "team_b_screenshot", columnDefinition = "TEXT")
    String teamBScreenshot;

    @Column(name = "team_b_dispute_explanation", columnDefinition = "TEXT")
    String teamBDisputeExplanation;

    @Column(name = "disputed")
    boolean disputed;

    @Column(name = "created_at")
    Instant createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class MatchReportId implements Serializable {
        String matchId;
        int round;

        public MatchReportId(String matchId, int round) {
            this.matchId = matchId;
            this.round = round;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            MatchReportId that = (MatchReportId) o;
            return round == that.round && java.util.Objects.equals(matchId, that.matchId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(matchId, round);
        }
    }
}

