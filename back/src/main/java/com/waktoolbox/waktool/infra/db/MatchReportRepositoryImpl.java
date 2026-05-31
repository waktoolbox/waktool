package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchReport;
import com.waktoolbox.waktool.domain.repositories.MatchReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class MatchReportRepositoryImpl implements MatchReportRepository {
    private final MatchReportSpringDataRepository _repository;

    @Override
    public Optional<MatchReport> findByMatchIdAndRound(String matchId, int round) {
        return _repository.findByMatchIdAndRound(matchId, round).map(this::toDomain);
    }

    @Override
    public List<MatchReport> findByMatchId(String matchId) {
        return _repository.findAllByMatchId(matchId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<MatchReport> findDisputedByTournamentId(String tournamentId) {
        return _repository.findAllByTournamentIdAndDisputedTrue(tournamentId).stream().map(this::toDomain).toList();
    }

    @Override
    public Set<String> findMatchIdsWithReports(String tournamentId) {
        return _repository.findDistinctMatchIdsByTournamentId(tournamentId);
    }

    @Override
    public void save(MatchReport report) {
        MatchReportEntity entity = new MatchReportEntity();
        entity.setMatchId(report.getMatchId());
        entity.setRound(report.getRound());
        entity.setTournamentId(report.getTournamentId());
        entity.setTeamAReportedWinner(report.getTeamAReportedWinner());
        entity.setTeamAReporterId(report.getTeamAReporterId());
        entity.setTeamAScreenshot(report.getTeamAScreenshot());
        entity.setTeamADisputeExplanation(report.getTeamADisputeExplanation());
        entity.setTeamBReportedWinner(report.getTeamBReportedWinner());
        entity.setTeamBReporterId(report.getTeamBReporterId());
        entity.setTeamBScreenshot(report.getTeamBScreenshot());
        entity.setTeamBDisputeExplanation(report.getTeamBDisputeExplanation());
        entity.setDisputed(report.isDisputed());
        entity.setCreatedAt(report.getCreatedAt() != null ? report.getCreatedAt() : Instant.now());
        _repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteByMatchId(String matchId) {
        _repository.deleteAllByMatchId(matchId);
    }

    @Override
    @Transactional
    public void deleteByMatchIdAndRound(String matchId, int round) {
        _repository.deleteByMatchIdAndRound(matchId, round);
    }

    private MatchReport toDomain(MatchReportEntity entity) {
        MatchReport report = new MatchReport();
        report.setMatchId(entity.getMatchId());
        report.setRound(entity.getRound());
        report.setTournamentId(entity.getTournamentId());
        report.setTeamAReportedWinner(entity.getTeamAReportedWinner());
        report.setTeamAReporterId(entity.getTeamAReporterId());
        report.setTeamAScreenshot(entity.getTeamAScreenshot());
        report.setTeamADisputeExplanation(entity.getTeamADisputeExplanation());
        report.setTeamBReportedWinner(entity.getTeamBReportedWinner());
        report.setTeamBReporterId(entity.getTeamBReporterId());
        report.setTeamBScreenshot(entity.getTeamBScreenshot());
        report.setTeamBDisputeExplanation(entity.getTeamBDisputeExplanation());
        report.setDisputed(entity.isDisputed());
        report.setCreatedAt(entity.getCreatedAt());
        return report;
    }
}

